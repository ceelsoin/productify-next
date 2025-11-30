# Copilot Context

This project is a SaaS built with **Next.js + TypeScript**.  
Users can upload one or more product photos, which are enhanced using AI.  
Then the system generates an automated **video using Remotion**, based on templates selected by the user.  

The final output includes:
- Enhanced images  
- Generated video  
- Viral product descriptions and hooks  
- Everything available for download  

The SaaS operates using **credits**, which users can recharge via **Stripe**.

---

## 🏗 Stack & Technologies

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**, with a clean and beautiful **dark SaaS theme**
- **Stripe** (payments and credit system)
- **Remotion** (video rendering)
- **Google Nano Banana** (image enhancement)
- **Whisper.cpp** (captions generation)
- **Google TTS** (voice-over / text-to-speech audio)
- File storage (S3, GCS, or similar)

---

## 🎯 Core Features

### 1. Image upload + enhancement
- User uploads one or multiple product images.
- System uses **Google Nano Banana** to improve lighting, background, sharpness, etc.
- Improved images must be saved and available for download.

### 2. Automated video generation using Remotion
- User selects a video template.
- The system automatically assembles:
  - scenes  
  - transitions  
  - text  
  - enhanced images  
  - optional voice-over via Google TTS  
  - optional captions via Whisper.cpp  
- Final video must be available for download.
- Credit consumption must reflect processing cost.

### 3. Product text generation
Automatically generate:
- product descriptions  
- viral hooks  
- ad-oriented copy suggestions  

### 4. Credit system
- All operations consume credits.
- Credits are recharged via **Stripe**.
- Account UI must include:

