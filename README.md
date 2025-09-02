<div align="center">

# Glow Guide Mama

An AI + nurse assisted maternal wellness platform: education, symptom triage, real‑time chat, community, marketplace & premium medical center access — built with React, Vite, TypeScript, Tailwind, shadcn-ui, and Supabase.

</div>

---

## ✨ Core Value
Mothers get trustworthy, contextual guidance in one place — from trimester education to urgent symptom clarification and escalation to human nurses — reducing anxiety and improving continuity of care.

## 🧩 Feature Overview
- Ask a Nurse: Hybrid AI → human escalation (Telegram/Edge Function pipeline)
- Symptom Checker: Structured self‑triage (v2 risk scoring roadmap)
- Article Library: Curated educational content (personalization roadmap)
- Community Forum: Peer support & engagement loops
- Marketplace: Future commerce & affiliate layer
- Medical Centers (Premium): Verified directory + emergency quick access
- Profile & Avatars: Supabase auth + RLS secured profile table
- Dark Mode: Optimized nighttime palette for readability & contrast

## 🏗 Architecture
| Layer | Tech | Notes |
|------|------|-------|
| Frontend | React 18 + Vite + TypeScript | SPA with route code-splitting |
| Styling | Tailwind CSS + shadcn-ui | HSL design tokens; dark theme refinements |
| State/Auth | Supabase Auth + custom `AuthContext` | Session + profile hydration, premium flag |
| Data | Supabase Postgres | Tables: profiles, chat_conversations, chat_messages, products, medical_centers |
| Real-time | Supabase Realtime | Live chat stream subscriptions |
| Edge Logic | Supabase Edge Functions | AI response orchestration, nurse escalation (Telegram) |
| Payments | Flutterwave (React SDK) | Premium subscription (roadmap: lifecycle automation) |
| Analytics (Planned) | Posthog / OpenPanel (placeholder) | Event & retention funnel instrumentation |

## 📂 Key Directory Structure
```
src/
	components/
		layout/ (AppShell, PageHeader)
		nurse/ (AskNurse chat UI)
		premium/ (Premium upgrade flow)
		symptom-checker/
		ui/ (shadcn primitives & custom wrappers)
	pages/ (Route-level screens)
	contexts/ (AuthContext, hooks)
	integrations/supabase/
	lib/ (types, utils)
supabase/
	migrations/ (schema evolution)
	functions/ (edge functions: get-ai-response, telegram-chat, etc.)
```

## 🔐 Environment Variables
Create a `.env` (or `.env.local`) at repo root:
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_FLUTTERWAVE_PUBLIC_KEY=<your-flutterwave-public-key>
# Optional / roadmap
VITE_ANALYTICS_WRITE_KEY=<analytics-key>
```

Never commit secret service role keys. For secure server-side operations use Edge Functions with service role available only in that runtime.

## 🚀 Getting Started
```bash
git clone <repo-url>
cd glow-guide-mama-main
npm install
cp .env.example .env   # if you create one
npm run dev
```
Visit: http://localhost:5173 (default Vite port).

### Type Checking & Lint
```bash
npx tsc --noEmit
npm run lint
```

### Build & Preview
```bash
npm run build
npm run preview
```

## 👤 Authentication & Profiles
- User signs up (Supabase auth) → row-level policy creates profile (migration: create_profile_on_signup)
- Profile fields: id, email, display_name, avatar_url, is_premium, lmp_date, etc.
- Premium gating: pages (e.g., Medical Centers) read `profile.is_premium`.

## 💬 Chat Flow (Ask a Nurse)
1. User sends message → optimistic insert to `chat_messages`
2. Edge function (AI) processes, persists AI response
3. Escalation flag triggers nurse notification (Telegram function) when confidence low or user requests human help
4. Real-time subscription updates UI instantly

## 🎨 Theming
Tailwind + CSS custom properties for semantic tokens (background, surface layers, accents). Dark mode tuned for legibility, bubble differentiation (user vs AI vs nurse) and reduced nighttime glare.

## 🧪 Testing (Suggested Additions)
Currently minimal; recommended next steps:
- Unit: utils & context
- Integration: chat flow mock, premium gating
- Visual regression: dark mode palettes

## 🗺 Product Roadmap (High-Level)
Quarterly themes (succinct version):
- Q1: Adaptive onboarding, real-time message status, analytics dashboards, clinician trust badges
- Q2: Multilingual rollout, symptom intelligence v2 (risk tiers), subscription lifecycle polish, contextual premium teasers
- Q3: Behavioral nudges, cohort experimentation, marketplace growth & redemption codes, community reputation layer
- Q4: Regional expansion, Partner API, predictive risk scoring (explainable), outcomes dashboards

## 🛡 Security & Policies
- Supabase RLS restricts profiles & chat messages to owners
- Edge functions enforce controlled AI & escalation logic
- Avatar storage bucket scoped with read/write policies

## 📦 Tech Decisions Rationale
- Supabase for speed: auth + realtime + SQL flexibility
- shadcn-ui for consistent, accessible primitives without heavy design system overhead
- Vite for fast DX & incremental builds
- Segregated PageHeader & AppShell for unified navigation patterns

## 🧠 AI Prompt Recipe (Representative Samples)
Not exhaustive; these illustrate how AI assistance shaped the codebase. Adapt wording as needed — outputs may vary.

### 1. Refactor & Consistency
"Refactor all page headers into a single reusable PageHeader component with optional back button and right-aligned action slot, then apply it across CommunityForum, ArticleLibrary, Marketplace, MedicalCenters, PremiumScreen, AskNurse, SymptomChecker."

### 2. Dark Mode Enhancement
"Redesign dark theme tokens for better depth (layered surfaces), improve chat bubble contrast (user/AI/nurse), ensure accessible color contrast ratios. Provide updated CSS variables." 

### 3. Chat Experience Upgrade
"Revamp AskNurse component for mobile: collapsible conversation list, sticky input bar, labeled bubbles for AI vs Nurse vs User, pill toggle for AI/Human mode, responsive layout."

### 4. Premium Gating
"Add premium gating to MedicalCenters page: if user not logged in show sign-in CTA, if logged in but not premium show upgrade module, otherwise show centers; update emergency number to +2349091481560."

### 5. Auth & Profile Stability
"Audit AuthContext for unnecessary re-renders and infinite loops; implement memoization and a single profile fetch with loading + error states."

### 6. Cleanup & Audit
"List unused UI component files by searching for imports (carousel, chart, menubar, navigation-menu, etc.) and prepare a safe deletion plan."

### 7. Investor Materials
"Generate a 10-slide investor-style summary for an AI + nurse maternal health platform covering problem, solution, market, model, traction, tech moat, GTM, roadmap, ask."

### 8. Roadmap Storytelling
"Rewrite roadmap to be more compelling; remove code deletion task and emphasize personalization, intelligence, monetization, scalability."

### 9. Prompt Crafting Meta
"Given the existing features, suggest higher impact next steps that strengthen retention and differentiation (analytics, personalization, predictive risk)."

### 10. README Generation
"Draft a comprehensive README including architecture, setup, environment variables, roadmap, and a section summarizing representative AI prompts used during development."

> Tip: For reproducibility, chain prompts (refactor → test → polish) and request diffs or focused patches to minimize unintended changes.

## 🔄 Deployment
- Current: Vite build artifacts (static) + Supabase backend
- Option: Use edge functions for AI & notifications (already scaffolded)
- For domain: Configure via hosting provider (e.g., Vercel / Netlify) + environment variables

## 🤝 Contributions
Internal MVP stage. Open to: accessibility improvements, test coverage PRs, performance profiling, localization contributions (Q2 roadmap).

## 📜 License
Proprietary (update when ready). Add an OSS license if/when opening contributions publicly.

## 🙋 Support / Contact
- Issues: GitHub Issues
- Product / Partnership Inquiries: (add email)

---
Crafted with a blend of human product thinking & AI-assisted iteration. ✨
