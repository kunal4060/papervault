# Cloudinary Setup — PaperVault (FREE, no card)

Firebase Storage ko Blaze (paid) plan chahiye, isliye PaperVault ab **Cloudinary free tier** use karta hai PDF uploads ke liye. Firestore (database + auth) waise hi Firebase pe rahega — sirf **file storage** Cloudinary pe gaya hai.

## Ek baar ka setup (5 min)

1. **Free account banao:** https://cloudinary.com/users/register_free — card nahi mangta.
2. **Cloud name copy karo:** Dashboard ke top pe dikhega (e.g. `dxyabc123`).
3. **Unsigned upload preset banao:**
   - Dashboard → Settings (gear icon) → **Upload** tab → **Upload presets** → **Add upload preset**
   - **Signing Mode:** `Unsigned` select karo (zaroori!)
   - **Folder:** `papervault` (optional, organized rahega)
   - Baaki default rehne do → **Save**. Preset ka naam copy karo (e.g. `papervault_unsigned`).
4. **`.env` me daalo** (project root me `.env` file banao agar nahi hai):
   ```
   VITE_CLOUDINARY_CLOUD_NAME=tumhara_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=tumhara_preset_naam
   ```
5. **Rebuild + redeploy:** `npm run build` → `dist/` ko gh-pages pe push karo.

## Kaise kaam karta hai

- `src/lib/cloudinary.js` — upload logic (same function names as old `src/firebase/storage.js`).
- PDFs `raw` type se upload hote hain → `https://res.cloudinary.com/...` wala permanent URL Firestore ke `uploads` record me save hota hai.
- Free tier: ~25 GB storage/bandwidth per month — PaperVault ke ~200 MB ke liye bahut hai.

## Note

- Cloud name + preset naam **public** hote hain (frontend code me rehte hain) — ye secret nahi hain, tension mat lo.
- Uploads sirf login wale users kar sakte hain (app ka LoginGate waise hi hai); preset pe chaaho toh file-size limit laga sakte ho Cloudinary dashboard se.
