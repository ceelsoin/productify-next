# AI Product Media Generator — SaaS Platform

A SaaS platform built with **Next.js**, **TypeScript**, and **Tailwind CSS**, allowing users to upload product photos and automatically generate:

- Enhanced product images (via **Google Nano Banana**)  
- Custom promotional videos (via **Remotion** templates)  
- Viral product descriptions and hooks  
- Captions (via **Whisper.cpp**)  
- Optional voice-over (via Google TTS)

Users consume **credits** for each generation and can recharge them using **Stripe**.

---

## 🚀 Features

### 📸 Product Image Enhancement
- Upload one or multiple product photos  
- AI-enhanced images using Google Nano Banana  
- Automatic background improvement, color correction, and sharpening  
- Final images available for download  

### 🎬 Automated Video Generation
- Choose from Remotion templates  
- Video automatically assembled with:
  - scenes  
  - transitions  
  - enhanced images  
  - generated text  
  - captions (Whisper.cpp)  
  - voice-over (Google TTS)  
- Video rendered and available for download  

### ✍️ AI Product Copywriting
Generate:
- Product descriptions  
- Viral hooks  
- Ad copy  

### 💳 Credit System + Stripe Billing
- Each generation consumes credits  
- Credits can be purchased via Stripe  
- Users can track their remaining credits  

### 🧭 Interface Sections

My Products
Generate New

Account Menu
My Credits


---

## 🛠 Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS** (dark SaaS theme)
- **Stripe** (payments and credit system)
- **Remotion** (video generation)
- **Google Nano Banana** (image enhancement)
- **Whisper.cpp** (captions)
- **Google TTS** (voice-over generation)
- Storage: S3, GCS, or equivalent

---

## 📁 Project Structure (Suggested)

/app

routes, pages, UI components
/components

reusable UI components
/lib

Stripe, TTS, Whisper, Nano Banana integrations
/services

business logic for media generation
/templates

Remotion video templates
/types

shared TypeScript types


---

## 🧪 Testing
Future versions will include:
- Unit tests  
- Integration tests  
- Video generation validation  
- Image enhancement pipelines  

---

## 🔐 Security Considerations
- Uploaded files are validated and sanitized  
- Credits deducted only after successful processing  
- Retry-safe asynchronous workflows  

---

## 📜 License
This project uses a custom commercial license.  
Contact the author for SaaS resale rights or integration permissions.

