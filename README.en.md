<!-- Copyright (c) 2025-2026 Gene Ressler
     Modified in 2026 (2026-11-22) for Traditional Chinese educational localization (BridgeDesigner_TW).
     SPDX-License-Identifier: GPL-3.0-or-later -->

# Bridge Designer, Cloud Edition — Unofficial Traditional Chinese Educational Fork (`BridgeDesigner_TW`)

> **Language / 語言切換**：[繁體中文（預設）](README.md) ｜ **English**
>
> **Live Demo (GitHub Pages)**: https://begin0808.github.io/BridgeDesigner_TW/

---

## Purpose

This repository is an **unofficial, free, non-commercial Traditional Chinese (`zh-Hant`, Taiwan terminology) educational localization** of [gene-ressler/bridge-designer](https://github.com/gene-ressler/bridge-designer) (*Bridge Designer, Cloud Edition*, formerly West Point Bridge Designer / ASCE Bridge Designer).

It was created for **Traditional Chinese educators, students, and learners** so anyone studying structural engineering can explore truss bridge design, finite-element load testing, slenderness/buckling mechanics, and cost optimization directly in their native language without a language barrier.

---

## Licensing, Attribution & Compliance

1. **Upstream Software & GPLv3 Compliance**
   - Upstream repository: [gene-ressler/bridge-designer](https://github.com/gene-ressler/bridge-designer)
   - Original copyright: **Copyright © 2025-2026 Gene Ressler** (original authors: Steve Ressler, PE, PhD & Gene Ressler, PhD).
   - License: Released as a whole under the **[GNU General Public License v3.0 or later (GPL-3.0-or-later)](COPYING)**, retaining the full upstream Git commit history and original file copyright headers.
   - **Modification Notice (GPLv3 Section 5(a))**: Modified on **2026-11-22** by `BridgeDesigner_TW` contributors to add Traditional Chinese localization, CJK PDF font rendering, CJK full-text help search, and interactive classroom onboarding widgets.
2. **Embedded Traditional Chinese Font**
   - `public/fonts/NotoSansTC-Regular.ttf` (Noto Sans TC) is licensed under the **[SIL Open Font License 1.1](public/fonts/OFL.txt)** (license text included in `public/fonts/OFL.txt`).
3. **Non-Commercial Educational Use Notice (`jqwidgets-ng`)**
   - The upstream project depends on `jqwidgets-ng`, whose free license (CC BY-NC 3.0) applies to non-commercial / educational use.
   - **This fork and its GitHub Pages site are strictly for free, ad-free, non-commercial educational use only**, and must not be used for commercial purposes or real-world structural engineering.
4. **No Official Affiliation or Endorsement**
   - This project is **not affiliated with, sponsored by, or endorsed by** the United States Military Academy (West Point / USMA), the American Society of Civil Engineers (ASCE), or the upstream authors.
   - For the official English release, please visit the [ASCE Bridge Designer Official Website](https://www.asce.org/career-growth/pre-college-outreach/bridge-designer).

---

## Summary of Modifications (`2026-11-22`)

- **Complete UI Localization (`zh-Hant`)**: Translated all menus, toolbars, setup wizard, materials & cross-section labels, drafting title block & annotations, member table (including empty-state guidance), load test & cost reports, member details, instability/slenderness dialogs, 3D animation controls, design iterations, save/load, 3D print export UI, sample bridges, and templates.
- **Traditional Chinese PDF Export**: Added lazy-loaded static TrueType font support (`src/app/shared/services/pdf-font.service.ts` + `NotoSansTC-Regular.ttf`) for `jsPDF` & `jspdf-autotable` so exported engineering drawings, load test reports, and cost reports render Traditional Chinese cleanly.
- **Tips, Toasts & Browser Checks**: Translated all 36 Tips of the Day, 18 toast notifications, and browser compatibility pages (`public/browserinfo/index.html`).
- **Complete Help System & CJK Full-Text Search**: Translated all 178 help topics and bilingual (`中文（English）`) engineering glossary entries (`src/app/features/help/help-topic/help-topic.component.html`), updated `indexer/build.py` for UTF-8/CJK punctuation, and added a custom CJK + ASCII tokenizer (`tokenizeCjk`) to `@orama/orama` in `help-index.service.ts`.
- **Classroom Onboarding Features (`src/app/features/tutorial/`)**:
  - **Interactive 5-Step Classroom Guide (`<classroom-guide>`)**: Draggable floating guide that auto-detects student progress (joints → members → load test → force optimization → PDF report) and auto-collapses during 3D load-test animations.
  - **Illustrated Quick-Start Guide (`<quick-start-dialog>`)**: 4-tab quick reference covering workflow steps, toolbar icons, compression/tension color interpretation, and common failure troubleshooting.
  - **Official Links**: Added direct links back to the official ASCE website and upstream GitHub repository in the toolbar, Help menu, Quick-Start dialog, and About dialog.

---

## Development & Build

```bash
npm install
npx ng serve --port 4200

# Production build for GitHub Pages
npx ng build --configuration production --base-href /BridgeDesigner_TW/
```

Deployment to GitHub Pages is automated via [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) on pushes to `main`.
