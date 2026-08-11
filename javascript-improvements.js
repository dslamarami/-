// ============================================
// تحسينات JavaScript صغيرة للـ HTML
// (هذا يستبدل دالة callServerlessBackend فقط)
// ============================================

async function callServerlessBackend(payload) {
    try {
        showWait(
            currentLang === 'ar'
                ? 'جاري معالجة طلبك...'
                : 'Processing your request...'
        );

        const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            timeout: 30000
        });

        let data;
        try {
            data = await res.json();
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            renderResult(
                currentLang === 'ar'
                    ? 'خطأ: الخادم أرسل رد غير صحيح'
                    : 'Error: Server returned invalid response'
            );
            return;
        }

        // معالجة الأخطاء
        if (!res.ok) {
            const errorMessage = 
                data?.message || 
                data?.error?.message ||
                data?.error || 
                `HTTP ${res.status}`;

            console.error('API Error:', {
                status: res.status,
                error: errorMessage,
                fullResponse: data
            });

            renderResult(
                currentLang === 'ar'
                    ? `❌ حدث خطأ:\n\n${errorMessage}\n\nتأكد من:\n1. تحديث صفحة المتصفح\n2. إضافة GEMINI_API_KEY في Vercel\n3. عدم انتهاء صلاحية المفتاح`
                    : `❌ Error:\n\n${errorMessage}\n\nMake sure:\n1. Refresh the page\n2. Add GEMINI_API_KEY to Vercel\n3. API key is not expired`
            );
            return;
        }

        // معالجة الرد الناجح
        if (
            data?.candidates &&
            data.candidates.length > 0 &&
            data.candidates[0]?.content?.parts
        ) {
            const textParts = data.candidates[0].content.parts
                .filter(part => part.text)
                .map(part => part.text)
                .join('\n');

            if (textParts) {
                speechText = String(textParts).replace(/<[^>]*>/g, '');
                renderResult(textParts);
                return;
            }
        }

        // إذا لم تصل نتيجة
        renderResult(
            currentLang === 'ar'
                ? 'لم يتمكن Gemini من الرد. حاول مرة أخرى.'
                : 'Gemini could not respond. Please try again.'
        );

    } catch (error) {
        console.error('Network Error:', error);

        renderResult(
            currentLang === 'ar'
                ? `❌ خطأ في الاتصال:\n\n${error.message}\n\nتأكد من:\n1. الاتصال بالإنترنت\n2. أن التطبيق مثبت بشكل صحيح\n3. فتح DevTools (F12) لمزيد من التفاصيل`
                : `❌ Connection error:\n\n${error.message}\n\nCheck:\n1. Your internet connection\n2. App is deployed correctly\n3. Open DevTools (F12) for details`
        );
    }
}

// ============================================
// تحسين دالة showWait
// ============================================

function showWait(msg) {
    const responseBox = document.getElementById('response-box');
    const responseText = document.getElementById('response-text');
    const audioPanel = document.getElementById('audio-panel');

    if (responseBox) responseBox.style.display = 'block';
    if (responseText) {
        responseText.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>${msg}</span>
            </div>
        `;
    }
    if (audioPanel) audioPanel.style.display = 'none';
}

// ============================================
// تحسين دالة renderResult
// ============================================

function renderResult(txt) {
    if (!txt) return;

    speechText = String(txt).replace(/<[^>]*>/g, '');

    const responseBox = document.getElementById('response-box');
    const responseText = document.getElementById('response-text');
    const audioPanel = document.getElementById('audio-panel');

    if (responseBox) responseBox.style.display = 'block';
    if (responseText) {
        responseText.innerHTML = String(txt)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    if (audioPanel) audioPanel.style.display = 'flex';

    // إضافة scroll سلس
    setTimeout(() => {
        responseBox?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ============================================
// معالج محسّن لـ GPS
// ============================================

function triggerNativeGPS() {
    showWait(
        currentLang === 'ar'
            ? 'جاري تحديد موقعك الجغرافي...'
            : 'Locating your position...'
    );

    if (!navigator.geolocation) {
        renderResult(
            currentLang === 'ar'
                ? '❌ خدمة الموقع غير مدعومة في هذا الجهاز'
                : '❌ GPS is not supported on this device'
        );
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function (pos) {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            try {
                // استخدم Nominatim للحصول على اسم المكان
                const reverseGeoRes = await fetch('/api/maps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'reverse',
                        lat: lat,
                        lng: lng
                    })
                });

                const geoData = await reverseGeoRes.json();
                const locationName = geoData.place || `${lat}, ${lng}`;

                // استخدم معلومات الموقع لإنشاء prompt
                const prompt =
                    currentLang === 'ar'
                        ? `أنا في ${locationName} بالمملكة العربية السعودية.\n\nأخبرني قصة سياحية مشوقة عن هذا المكان والمعالم القريبة منه.`
                        : `I'm currently at ${locationName} in Saudi Arabia.\n\nTell me an interesting tourism story about this location and nearby landmarks.`;

                await callServerlessBackend({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                });

            } catch (error) {
                console.error('Reverse geocoding failed:', error);

                // بدء الخادم بدون معلومات الموقع الدقيقة
                const prompt =
                    currentLang === 'ar'
                        ? 'حكِ لي قصة سياحية جميلة عن أشهر المعالم والمدن السياحية في المملكة العربية السعودية.'
                        : 'Tell me an interesting tourism story about Saudi Arabia\'s most famous landmarks.';

                await callServerlessBackend({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                });
            }
        },

        function (error) {
            renderResult(
                currentLang === 'ar'
                    ? `❌ خطأ الموقع:\n\n${error.message || 'تم رفض إذن الموقع'}`
                    : `❌ Location error:\n\n${error.message || 'Location permission was denied'}`
            );
        }
    );
}

// ============================================
// تحسين معالج الصور
// ============================================

async function runVisualAI() {
    if (!uploadedBase64) {
        renderResult(
            currentLang === 'ar'
                ? '❌ يرجى رفع صورة أولاً'
                : '❌ Please upload an image first'
        );
        return;
    }

    showWait(
        currentLang === 'ar'
            ? 'جاري تحليل الصورة بواسطة Gemini AI...'
            : 'Analyzing image with Gemini AI...'
    );

    const prompt =
        currentLang === 'ar'
            ? `أنت مرشد سياحي متخصص في المملكة العربية السعودية.

حلل الصورة المرفقة وحدد:
1. ماذا يظهر في الصورة؟
2. ما اسم المعلم أو الشيء (إن أمكن)؟
3. المنطقة السعودية المرتبطة به
4. نبذة تاريخية/ثقافية
5. أهميته السياحية

إذا لم تكن متأكداً من معلومة، قل بوضوح بدلاً من الاختراع.`
            : `You are a Saudi Arabia tourism expert.

Analyze the image and identify:
1. What appears in the image?
2. Name of the landmark or object (if identifiable)
3. Related Saudi region
4. Historical or cultural background
5. Tourism significance

If uncertain about something, say so clearly instead of guessing.`;

    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: uploadedMime,
                        data: uploadedBase64
                    }
                }
            ]
        }]
    };

    await callServerlessBackend(payload);
}

// ============================================
// نصيحة: انسخ هذا الكود إلى ملف HTML الأساسي
// استبدل الدوال الأصلية بهذه المحسّنة
// لا تغيير في التصميم - فقط تحسينات في الأداء والأخطاء
// ============================================
