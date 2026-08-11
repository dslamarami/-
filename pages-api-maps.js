export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        const { action, lat, lng, destination } = req.body || {};

        // ==========================================
        // 1. Reverse Geocoding - تحويل الإحداثيات إلى اسم مكان
        // ==========================================

        if (action === 'reverse') {
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                return res.status(400).json({
                    error: 'lat and lng must be numbers'
                });
            }

            try {
                const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&accept-language=ar`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Murshedak-AI/1.0'
                    },
                    timeout: 10000
                });

                if (!response.ok) {
                    throw new Error(`Nominatim error: ${response.status}`);
                }

                const data = await response.json();

                return res.status(200).json({
                    success: true,
                    latitude: lat,
                    longitude: lng,
                    place: data.display_name || 'Unknown location',
                    address: data.address || {}
                });

            } catch (error) {
                console.error('Reverse geocoding error:', error);
                return res.status(500).json({
                    error: 'Failed to reverse geocode location',
                    message: error.message
                });
            }
        }

        // ==========================================
        // 2. أماكن قريبة - Nearby Places
        // ==========================================

        if (action === 'nearby') {
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                return res.status(400).json({
                    error: 'lat and lng must be numbers'
                });
            }

            try {
                const radius = 5000;

                const query = `
[out:json][timeout:15];

(
  node(around:${radius},${lat},${lng})["tourism"];
  way(around:${radius},${lat},${lng})["tourism"];

  node(around:${radius},${lat},${lng})["amenity"="restaurant"];
  way(around:${radius},${lat},${lng})["amenity"="restaurant"];

  node(around:${radius},${lat},${lng})["historic"];
  way(around:${radius},${lat},${lng})["historic"];
);

out center tags;
`;

                const response = await fetch(
                    'https://overpass-api.de/api/interpreter',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Murshedak-AI/1.0'
                        },
                        body: `data=${encodeURIComponent(query)}`,
                        timeout: 20000
                    }
                );

                if (!response.ok) {
                    throw new Error(`Overpass API error: ${response.status}`);
                }

                const data = await response.json();

                const places = (data.elements || [])
                    .map(place => {
                        const pLat = place.lat ?? place.center?.lat;
                        const pLng = place.lon ?? place.center?.lon;
                        const tags = place.tags || {};

                        return {
                            name: tags.name_ar || tags.name || 'مكان قريب',
                            type: tags.tourism || tags.historic || tags.amenity || 'place',
                            latitude: pLat,
                            longitude: pLng
                        };
                    })
                    .filter(place => place.latitude && place.longitude)
                    .slice(0, 20);

                return res.status(200).json({
                    success: true,
                    count: places.length,
                    places
                });

            } catch (error) {
                console.error('Nearby places error:', error);
                return res.status(500).json({
                    error: 'Failed to fetch nearby places',
                    message: error.message
                });
            }
        }

        // ==========================================
        // 3. حساب المسار - Route Calculation
        // ==========================================

        if (action === 'route') {
            if (typeof lat !== 'number' || typeof lng !== 'number' || !destination) {
                return res.status(400).json({
                    error: 'lat, lng, and destination are required'
                });
            }

            try {
                // الخطوة 1: تحويل اسم الوجهة إلى إحداثيات
                const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1&accept-language=ar`;

                const geoResponse = await fetch(geocodeUrl, {
                    headers: {
                        'User-Agent': 'Murshedak-AI/1.0'
                    },
                    timeout: 10000
                });

                if (!geoResponse.ok) {
                    throw new Error(`Geocoding error: ${geoResponse.status}`);
                }

                const geoData = await geoResponse.json();

                if (!geoData || geoData.length === 0) {
                    return res.status(404).json({
                        error: 'Destination not found',
                        destination: destination
                    });
                }

                const destinationLat = Number(geoData[0].lat);
                const destinationLng = Number(geoData[0].lon);

                // الخطوة 2: حساب المسار
                const routeUrl = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${destinationLng},${destinationLat}?overview=false&alternatives=true`;

                const routeResponse = await fetch(routeUrl, {
                    headers: {
                        'User-Agent': 'Murshedak-AI/1.0'
                    },
                    timeout: 15000
                });

                if (!routeResponse.ok) {
                    throw new Error(`Routing error: ${routeResponse.status}`);
                }

                const routeData = await routeResponse.json();

                if (routeData.code !== 'Ok' || !routeData.routes || routeData.routes.length === 0) {
                    return res.status(404).json({
                        error: 'No route found',
                        code: routeData.code
                    });
                }

                const routes = routeData.routes.map((route, index) => ({
                    routeNumber: index + 1,
                    distanceKm: Number((route.distance / 1000).toFixed(1)),
                    durationMinutes: Math.round(route.duration / 60),
                    durationHours: Math.round((route.duration / 3600) * 10) / 10
                }));

                return res.status(200).json({
                    success: true,
                    origin: {
                        latitude: lat,
                        longitude: lng
                    },
                    destination: {
                        name: destination,
                        latitude: destinationLat,
                        longitude: destinationLng
                    },
                    routesCount: routes.length,
                    routes
                });

            } catch (error) {
                console.error('Route calculation error:', error);
                return res.status(500).json({
                    error: 'Failed to calculate route',
                    message: error.message
                });
            }
        }

        // إذا لم تكن الـ action معروفة
        return res.status(400).json({
            error: 'Unknown action',
            validActions: ['reverse', 'nearby', 'route']
        });

    } catch (error) {
        console.error('Maps API error:', error);
        return res.status(500).json({
            error: 'Maps service error',
            message: error.message
        });
    }
}
