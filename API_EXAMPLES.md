# أمثلة استخدام الـ APIs 📡

## 🖼️ 1. تحليل الصور (Gemini API)

### مثال في JavaScript:
```javascript
async function analyzeImage() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('اختر صورة أولاً');
        return;
    }
    
    // تحويل الصورة إلى Base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64 = e.target.result.split(',')[1];
        
        const payload = {
            contents: [{
                parts: [
                    {
                        text: "حلل هذه الصورة وأخبرني ماذا تحتوي؟"
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64
                        }
                    }
                ]
            }]
        };
        
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            console.log('النتيجة:', data);
            
            if (data.candidates && data.candidates[0]) {
                const text = data.candidates[0].content.parts[0].text;
                console.log('التحليل:', text);
            }
        } catch (error) {
            console.error('خطأ:', error);
        }
    };
    
    reader.readAsDataURL(file);
}
```

### مثال باستخدام cURL:
```bash
# استخدم base64 image data
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "صف هذه الصورة بالعربية"},
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "BASE64_IMAGE_DATA_HERE"
          }
        }
      ]
    }]
  }'
```

---

## 🗺️ 2. Reverse Geocoding (تحويل الإحداثيات إلى موقع)

### مثال في JavaScript:
```javascript
async function getReverseGeocode() {
    const latitude = 21.5433;  // جدة
    const longitude = 39.1728;
    
    try {
        const response = await fetch('/api/maps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'reverse',
                lat: latitude,
                lng: longitude
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('المكان:', data.place);
            console.log('البيانات:', data.address);
        } else {
            console.error('خطأ:', data.error);
        }
    } catch (error) {
        console.error('خطأ الاتصال:', error);
    }
}
```

### مثال باستخدام cURL:
```bash
curl -X POST http://localhost:3000/api/maps \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reverse",
    "lat": 21.5433,
    "lng": 39.1728
  }'
```

### الرد:
```json
{
  "success": true,
  "latitude": 21.5433,
  "longitude": 39.1728,
  "place": "جدة، منطقة مكة، المملكة العربية السعودية",
  "address": {
    "city": "Jeddah",
    "state": "Makkah Region",
    "country": "Saudi Arabia"
  }
}
```

---

## 📍 3. الأماكن القريبة (Nearby Places)

### مثال في JavaScript:
```javascript
async function getNearbyPlaces() {
    const latitude = 21.5433;   // جدة
    const longitude = 39.1728;
    
    try {
        const response = await fetch('/api/maps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'nearby',
                lat: latitude,
                lng: longitude
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`وجدنا ${data.count} أماكن قريبة:`);
            data.places.forEach(place => {
                console.log(`- ${place.name} (${place.type})`);
                console.log(`  الموقع: ${place.latitude}, ${place.longitude}`);
            });
        }
    } catch (error) {
        console.error('خطأ:', error);
    }
}
```

### مثال باستخدام cURL:
```bash
curl -X POST http://localhost:3000/api/maps \
  -H "Content-Type: application/json" \
  -d '{
    "action": "nearby",
    "lat": 21.5433,
    "lng": 39.1728
  }'
```

### الرد:
```json
{
  "success": true,
  "count": 5,
  "places": [
    {
      "name": "الكورنيش",
      "type": "tourism",
      "latitude": 21.543,
      "longitude": 39.175
    },
    {
      "name": "مطعم الزعيم",
      "type": "restaurant",
      "latitude": 21.544,
      "longitude": 39.174
    }
  ]
}
```

---

## 🛣️ 4. حساب المسار (Route Calculation)

### مثال في JavaScript:
```javascript
async function calculateRoute() {
    const currentLat = 21.5433;      // جدة
    const currentLng = 39.1728;
    const destination = "الرياض";     // الوجهة
    
    try {
        const response = await fetch('/api/maps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'route',
                lat: currentLat,
                lng: currentLng,
                destination: destination
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`المسافة من جدة إلى ${destination}:`);
            data.routes.forEach((route, index) => {
                console.log(`المسار ${index + 1}:`);
                console.log(`  المسافة: ${route.distanceKm} كم`);
                console.log(`  الوقت: ${route.durationMinutes} دقيقة (${route.durationHours} ساعات)`);
            });
        } else {
            console.error('خطأ:', data.error);
        }
    } catch (error) {
        console.error('خطأ الاتصال:', error);
    }
}
```

### مثال باستخدام cURL:
```bash
curl -X POST http://localhost:3000/api/maps \
  -H "Content-Type: application/json" \
  -d '{
    "action": "route",
    "lat": 21.5433,
    "lng": 39.1728,
    "destination": "الرياض"
  }'
```

### الرد:
```json
{
  "success": true,
  "origin": {
    "latitude": 21.5433,
    "longitude": 39.1728
  },
  "destination": {
    "name": "الرياض",
    "latitude": 24.7136,
    "longitude": 46.6753
  },
  "routesCount": 2,
  "routes": [
    {
      "routeNumber": 1,
      "distanceKm": "869.5",
      "durationMinutes": 810,
      "durationHours": 13.5
    },
    {
      "routeNumber": 2,
      "distanceKm": "892.3",
      "durationMinutes": 835,
      "durationHours": 13.9
    }
  ]
}
```

---

## 🔧 معالجة الأخطاء

### مثال شامل:
```javascript
async function callAPI(endpoint, payload) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        // التحقق من الحالة
        if (!response.ok) {
            console.error('خطأ من API:', {
                status: response.status,
                error: data.error,
                message: data.message
            });
            return null;
        }
        
        return data;
        
    } catch (error) {
        console.error('خطأ في الاتصال:', {
            message: error.message,
            name: error.name
        });
        return null;
    }
}

// الاستخدام:
const result = await callAPI('/api/maps', {
    action: 'reverse',
    lat: 21.5433,
    lng: 39.1728
});

if (result) {
    console.log('النتيجة:', result);
}
```

---

## 🧪 اختبار سريع

### في Browser Console:
```javascript
// 1. اختبر Gemini
fetch('/api/gemini', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        contents: [{
            parts: [{text: 'السلام عليكم'}]
        }]
    })
})
.then(r => r.json())
.then(d => console.log(d));

// 2. اختبر Maps
fetch('/api/maps', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        action: 'reverse',
        lat: 21.5433,
        lng: 39.1728
    })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## 💡 نصائح

1. **تحقق من الـ Console** لرسائل الخطأ
2. **استخدم Chrome DevTools** (F12) للـ Networking
3. **اختبر مع صور صغيرة** أولاً (< 2MB)
4. **تأكد من الـ API Key** في Vercel
5. **استخدم setTimeout** إذا كان الرد بطيئاً

---

## ✅ كل شيء يجب أن يعمل الآن! 🎉
