# 🔧 دليل حل المشاكل (Troubleshooting)

---

## ❌ خطأ: "GEMINI_API_KEY is missing"

### الأسباب المحتملة:
1. لم تضف المتغير في Vercel
2. اسم المتغير مختلف (case-sensitive)
3. لم تعد تحميل الصفحة بعد إضافة المتغير

### ✅ الحل:

**الخطوة 1:** اذهب إلى Vercel Dashboard
```
https://vercel.com/dashboard
```

**الخطوة 2:** افتح المشروع

**الخطوة 3:** Settings > Environment Variables

**الخطوة 4:** أضف متغير جديد:
```
Name:  GEMINI_API_KEY
Value: sk-proj-YOUR_ACTUAL_KEY_HERE
```

**الخطوة 5:** اضغط "Add"

**الخطوة 6:** اضغط "Deploy" أو أعد النشر:
```bash
git push
```

**الخطوة 7:** انتظر 1-2 دقيقة ثم اختبر

---

## ❌ خطأ: "Model not found"

### السبب:
استخدام إصدار نموذج خاطئ (مثل `gemini-3.6-flash`)

### ✅ الحل:
تحقق من أن ملف `pages/api/gemini.js` يحتوي على:
```javascript
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
```

النموذج الصحيح هو: **gemini-1.5-flash** ✓

---

## ❌ خطأ: "Server returned invalid response"

### السبب:
الخادم لم يرد JSON صحيح

### ✅ الحل:

1. **افتح DevTools** (F12)
2. اذهب إلى **Console**
3. انظر لرسالة الخطأ الكاملة
4. تحقق من:
   - هل API Key صحيح؟
   - هل المفتاح منتهي الصلاحية؟
   - هل هناك حد على عدد الطلبات؟

```javascript
// اختبر في Console:
fetch('/api/gemini', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        contents: [{
            parts: [{text: 'test'}]
        }]
    })
})
.then(r => r.text())  // اقرأ كـ text أولاً
.then(t => {
    console.log('Response:', t);
    try {
        console.log('Parsed:', JSON.parse(t));
    } catch (e) {
        console.error('Not valid JSON:', e);
    }
});
```

---

## ❌ خطأ: "Connection error"

### السبب:
- API Endpoint خاطئ
- عدم الاتصال بالإنترنت
- CORS مشكلة

### ✅ الحل:

1. **تحقق من الاتصال:**
```bash
ping google.com
```

2. **تحقق من Network في DevTools:**
   - افتح F12
   - اذهب إلى **Network** tab
   - حاول رفع صورة
   - انظر للطلب `/api/gemini`
   - انقر عليه واقرأ Response

3. **تأكد من الـ Endpoint:**
```javascript
// يجب أن يكون:
fetch('/api/gemini')  ✓

// وليس:
fetch('http://localhost:3000/api/gemini')  ✗
fetch('https://your-api.com/api/gemini')   ✗
```

---

## ❌ خطأ: "Image upload not working"

### السبب:
- صورة كبيرة جداً
- صيغة صورة غير مدعومة
- JavaScript error

### ✅ الحل:

1. **تحقق من حجم الصورة:**
   - حجم الصورة يجب أن يكون **< 5MB**
   - يفضل **< 2MB**

2. **اختبر الصيغ المدعومة:**
   - ✓ JPG/JPEG
   - ✓ PNG
   - ✓ GIF
   - ✓ WebP

3. **اختبر بصورة بسيطة:**
   - خذ صورة من جهازك
   - تأكد أنها < 2MB
   - جرّبها

4. **افتح Console وابحث عن أخطاء:**
```
F12 > Console
```

---

## ❌ خطأ: "Timeout"

### السبب:
- الخادم بطيء جداً
- الصور كبيرة جداً
- API مشغول

### ✅ الحل:

1. **استخدم صور أصغر:**
   ```
   بدل: 5MB
   استخدم: < 2MB
   ```

2. **استخدم gemini-1.5-flash:**
   - أسرع من Pro
   - الملفات الجديدة تستخدمه بالفعل ✓

3. **انتظر قليلاً وحاول مجدداً:**
   - قد يكون API مشغول
   - انتظر 30 ثانية وأعد المحاولة

---

## ❌ خطأ: "CORS error"

### السبب:
عدم وجود CORS headers

### ✅ الحل:
الملفات الجديدة تحتوي على CORS headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

تأكد من استخدام الملفات الجديدة!

---

## ❌ خطأ: "Location permission denied"

### السبب:
المستخدم رفض الموقع

### ✅ الحل:

1. **اطلب الإذن مجدداً:**
   - افتح المتصفح
   - افتح DevTools (F12)
   - انسخ هذا في Console:
   ```javascript
   navigator.geolocation.getCurrentPosition(
       pos => console.log('Lat:', pos.coords.latitude, 'Lng:', pos.coords.longitude),
       err => console.error('Error:', err)
   );
   ```

2. **أعد إذن الموقع:**
   - Chrome: 🔒 Lock > Permissions > Location
   - Firefox: Menu > Settings > Privacy > Permissions
   - Safari: Preferences > Privacy > Location

---

## ❌ خطأ: "Template literal error"

### السبب:
استخدام + بدلاً من backticks في الـ URLs

### ✅ الحل:
الملفات الجديدة تستخدم backticks:
```javascript
// صحيح ✓
const url = `https://api.example.com?lat=${lat}&lng=${lng}`;

// خاطئ ✗
const url = "https://api.example.com" + "?lat=" + lat + "&lng=" + lng;
```

---

## ✅ اختبار سريع

### الاختبار 1: Gemini API
```bash
curl -X POST https://your-domain.com/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "مرحباً"}]
    }]
  }'
```

### الاختبار 2: في Browser Console
```javascript
fetch('/api/gemini', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        contents: [{
            parts: [{text: 'Hello'}]
        }]
    })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
```

### الاختبار 3: صورة
```javascript
// 1. افتح ملف الصورة
// 2. حول إلى Base64
// 3. أرسل للـ API
```

---

## 🔍 كيفية القراءة من DevTools

### 1. فتح DevTools:
```
Windows/Linux: F12
Mac: Cmd+Option+I
```

### 2. اذهب إلى Console:
```
DevTools > Console tab
```

### 3. اذهب إلى Network:
```
DevTools > Network tab
1. جرّب عملية
2. انظر للطلب
3. اقرأ Response و Status
```

### 4. اقرأ الأخطاء:
```
✗ Red = Errors
⚠️ Yellow = Warnings
ℹ️ Blue = Info
```

---

## 📝 كيفية الإبلاغ عن مشكلة

إذا واجهت مشكلة:

1. **خذ Screenshot للخطأ**
2. **انسخ رسالة الخطأ من Console**
3. **اقرأ ملف الملخص:**
   - COMPLETE_SUMMARY.md
   - API_EXAMPLES.md

4. **تحقق من:**
   - هل استخدمت الملفات الجديدة؟
   - هل أضفت GEMINI_API_KEY؟
   - هل أعدت تحميل الصفحة؟

---

## ✅ Checklist نهائي

- [ ] استخدمت الملفات الجديدة
- [ ] أضفت GEMINI_API_KEY في Vercel
- [ ] أعدت تحميل الصفحة (Ctrl+Shift+R)
- [ ] حاولت من متصفح آخر
- [ ] تحققت من الإنترنت
- [ ] قرأت رسائل الخطأ بدقة
- [ ] فتحت DevTools واختبرت

---

## 🚀 إذا كل شيء يعمل:

```
✅ تحليل الصور
✅ GPS Location
✅ حساب المسارات
✅ الأماكن القريبة
✅ معالجة الأخطاء
✅ تطبيق يعمل بكمال 🎉
```

---

**حظ موفق! 💪**
