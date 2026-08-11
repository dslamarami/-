# دليل التثبيت والنشر 🚀

## 📁 هيكل المشروع الصحيح

```
your-project/
├── pages/
│   └── api/
│       ├── gemini.js      ← ملف تحليل الصور
│       └── maps.js        ← ملف خدمات الخرائط
├── public/
│   └── (صورك وملفاتك)
├── .env.local            ← متغيرات البيئة
└── package.json
```

---

## 🔑 الخطوة 1: إضافة API Keys

### في ملف `.env.local` (أو `.env.production` للـ Vercel):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### الحصول على Gemini API Key:
1. اذهب إلى: https://aistudio.google.com/app/apikey
2. اضغط "Create API key"
3. انسخ المفتاح

---

## 📝 الخطوة 2: إضافة الملفات

### استبدل `pages/api/gemini.js`:
```javascript
[استخدم محتوى ملف pages-api-gemini.js المرسول]
```

### استبدل `pages/api/maps.js`:
```javascript
[استخدم محتوى ملف pages-api-maps.js المرسول]
```

---

## 🎯 الخطوة 3: نشر على Vercel

### الطريقة 1: عبر GitHub (الأسهل)
```bash
git add .
git commit -m "Fix API endpoints"
git push origin main
```
Vercel سينشر تلقائياً ✨

### الطريقة 2: Vercel CLI
```bash
npm install -g vercel
vercel
```

### الطريقة 3: لوحة Vercel
1. اذهب إلى https://vercel.com/dashboard
2. افتح المشروع
3. اذهب إلى Settings > Environment Variables
4. أضف `GEMINI_API_KEY`
5. أعد النشر

---

## ✅ الاختبار

### اختبر الـ Gemini API:
```bash
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "مرحباً"}]
    }]
  }'
```

### اختبر الـ Maps API:
```bash
curl -X POST http://localhost:3000/api/maps \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reverse",
    "lat": 21.5433,
    "lng": 39.1728
  }'
```

---

## 🐛 حل المشاكل الشائعة

### ❌ "GEMINI_API_KEY is missing"
**الحل:**
- تأكد من إضافة المتغير في Vercel
- أعد النشر بعد إضافة المتغير
- تحقق من اسم المتغير بالضبط (case-sensitive)

### ❌ "Model not found"
**الحل:**
- تأكد من استخدام `gemini-1.5-flash` (ليس `3.6`)
- الملفات الجديدة تستخدم الإصدار الصحيح ✓

### ❌ "Timeout"
**الحل:**
- استخدم صور < 5MB
- استخدم gemini-1.5-flash (أسرع)
- الملفات الجديدة بها timeout handling ✓

### ❌ "CORS error"
**الحل:**
- الملفات الجديدة لها CORS headers ✓
- لا تحتاج لفعل شيء إضافي

---

## 📊 الملفات المحسّنة

### ✨ تحسينات `gemini.js`:
- ✅ استخدام `gemini-1.5-flash` الصحيح
- ✅ معالجة أخطاء قوية
- ✅ CORS headers كاملة
- ✅ Timeout handling
- ✅ رسائل خطأ واضحة

### ✨ تحسينات `maps.js`:
- ✅ إصلاح template literals (كانت تستخدم + خاطئة)
- ✅ CORS headers كاملة
- ✅ معالجة أخطاء شاملة
- ✅ Timeout على كل طلب
- ✅ التحقق من صحة البيانات
- ✅ رسائل خطأ واضحة بالعربية والإنجليزية

---

## 🎨 ملاحظة التصميم
✅ **لم يتم تغيير أي شيء في التصميم أو الـ HTML**
- جميع الـ CSS كما هي
- جميع الـ JavaScript للتصميم كما هو
- فقط تحسين API endpoints

---

## 📞 معلومات الاتصال
إذا واجهت مشكلة:
1. افتح Browser DevTools (F12)
2. انظر إلى Console لرسائل الخطأ
3. انظر إلى Network لحالة الـ requests
4. اقرأ رسالة الخطأ بدقة

---

## 🚀 يجب أن يعمل الآن!

بعد اتباع الخطوات:
- ✅ تحميل الصور سيعمل
- ✅ GPS سيعمل
- ✅ المسارات سيعمل
- ✅ الأماكن القريبة سيعمل

🎉 تطبيقك جاهز الآن!
