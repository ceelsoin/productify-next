# Contributing Guidelines

Thank you for your interest in contributing to this project!  
Please follow the guidelines below to ensure consistency and quality.

---

## 🧱 Project Principles

- Use **Next.js App Router** whenever possible  
- Code must be written in **strict TypeScript**  
- Prefer **functional components** and **React Server Components** when applicable  
- Keep components small, maintainable, and modular  
- Avoid unnecessary complexity and duplication  
- UI should follow a clean **dark SaaS theme** using Tailwind CSS  
- All media generation should be resilient and retryable  

---

## 🗂 Code Organization

- Place reusable UI components in `/components`
- API integrations go inside `/lib`
- Business logic pipelines inside `/services`
- Remotion video templates inside `/templates`
- Shared types in `/types`

Follow the existing architecture when adding new modules.

---

## 🧹 Code Style

- Use ESLint and Prettier (configs included in the repo)
- Follow functional programming principles when possible
- Always type all function inputs and outputs
- Avoid “magic values” — use constants or enums
- Keep Tailwind classes clean and organized

---

## 🧪 Testing

If submitting code that affects:
- media generation  
- credit consumption  
- integrations (Stripe, Whisper, TTS, Nano Banana)  

You must include appropriate tests or mock layers.

Testing priorities:
1. Business logic
2. API endpoints
3. Asynchronous workflows

---

## 🔥 Adding New Features

When adding a feature, please include:

1. **Description:** what the feature does  
2. **Technical overview:** architecture or flow explanation  
3. **UI changes:** screenshots or descriptions  
4. **Credit consumption rules (if applicable)**  
5. **Tests**  
6. **Migration notes (if needed)**  

---

## 🐛 Reporting Bugs

Include:

- steps to reproduce  
- expected behavior  
- actual behavior  
- environment (browser, OS, version)  
- logs if relevant  

---

## 🔐 Security & Privacy

- Do not log sensitive user information  
- Ensure uploads are validated and secure  
- Follow Stripe PCI-compliance guidelines  

---

## 🚀 Pull Request Process

1. Fork the repo  
2. Create a branch: `feature/my-new-feature`  
3. Commit with meaningful messages  
4. Ensure ESLint and Prettier pass  
5. Submit your PR  
6. A reviewer will provide feedback  

---

## ❤️ Code of Conduct

Be respectful, constructive, and collaborative.  
We aim for a friendly and inclusive environment.

Thanks for helping improve this project!
