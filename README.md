# PaperVault — Spatial Academic Digital Archive

[![React](https://img.shields.io/badge/React-19.2-black?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-black?style=flat-square&logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-black?style=flat-square&logo=three.js)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12.0-black?style=flat-square&logo=firebase)](https://firebase.google.com)
[![PDF.js](https://img.shields.io/badge/PDF.js-6.4-black?style=flat-square&logo=adobeacrobatreader)](https://mozilla.github.io/pdf.js/)

> **PaperVault** is an academic digital archive and past-paper intelligence platform designed for VIT-AP students with an immersive, tactile, monochromatic 3D aesthetic ("Archive Noir"). It delivers instant query retrieval across over 5,300 past question papers, automated AI paper analysis, duplicate detection, and responsive document rendering across desktop, tablet, and mobile devices.

---

## Live Website

Access the official deployed production platform:

### [Visit PaperVault](https://kunal4060.github.io/papervault/)

---

## 1. Project Introduction

PaperVault was engineered to solve the fragmentation of university exam preparation materials. Instead of scattered cloud drives, dead links, and chaotic student chat groups, PaperVault provides a structured, searchable, and verified repository of Previous Year Question Papers (PYQs), course syllabi, and faculty notes.

Students can instantly retrieve and preview papers for **CAT-1**, **CAT-2**, **FAT**, and **Lab FAT** examinations across all semesters, engineering branches, and faculty slots without mandatory logins, paywalls, or intrusive advertisements.

---

## 2. Branding & Visual Design System

### The Official PaperVault Identity
PaperVault features an official brand emblem combining classical serif typography (`PAPER VAULT`, `ESTD 2026`), delicate orbital elliptical geometry, four-point star celestial markers, and a pastel aura core.

```
       ✦               ✦
        \             /
      ╭───\─────────/───╮
      │    PAPER VAULT  │
      ╰───/─────────\───╯
        /             \
       ✦    ESTD 2026  ✦
```

- **Emblem Derivatives**:
  - `public/images/papervault-logo.png`: 1024×1024 master high-resolution brand asset.
  - `public/images/papervault-logo-tight.png`: Optically framed variant optimized for UI badges and cards.
  - `public/images/papervault-icon-192.png`: 192×192 progressive web app and touch icon derivative.
  - `public/favicon.svg`: Vector SVG container with crisp raster fallback for browser tabs.
- **Brand Placements**:
  - **Main Navigation**: Sleek, elevated badge with crisp typography in the sticky header.
  - **Hero Section**: Embedded in the spatial coordinate status pill (`PV-SYS // VIT-AP DIGITAL ARCHIVE · ESTD 2026`).
  - **Footer**: High-contrast emblem centerpiece anchoring the archive finale.
  - **Admin Gate & Login**: Official branding badge on verification screens.
  - **Social Media Previews**: Open Graph and Twitter Card large image tags.

### The 12-Shade Monochromatic Palette ("Archive Noir")
PaperVault maintains a clean, distraction-free grayscale visual system, preventing visual fatigue during intensive late-night revision:

| Shade Name | Hex Code | Interface Application |
| :--- | :--- | :--- |
| **Deep Space** | `#000000` | Canvas base & WebGL viewport backdrop |
| **Rich Obsidian** | `#050505` | Primary body background |
| **Charcoal Base** | `#0A0A0A` | Section & viewport container fills |
| **Graphite Dark** | `#101010` | Elevated surfaces & card backdrops |
| **Card Surface** | `#151515` | Default card & input background |
| **Border Dark** | `#1C1C1C` | Structural rules & hairline dividers |
| **Border Mid** | `#242424` | Interactive component borders |
| **Border Light** | `#333333` | Hover & focus boundary highlights |
| **Muted Grey** | `#555555` | Secondary metadata & captions |
| **Mid Grey** | `#777777` | Body descriptions & icons |
| **Silver Bright** | `#AAAAAA` | Emphasized metadata & subheadings |
| **Off-White** | `#D8D8D8` | High-contrast secondary text |
| **Pure White** | `#FFFFFF` | Primary headers & active highlights |

---

## 3. Spatial 3D Architecture & Floating Elements

The entire platform is constructed with a persistent sense of physical dimension:

```
    ┌─────────────────────────────────────────────────────────────┐
    │                      HERO SCENE 3D                          │
    │   Procedural Blueprint Canvas  •  Titanium Orbital Rings    │
    │     Delta-Time Spring Physics  •  Scroll Parallax Vectors   │
    └──────────────────────────────┬──────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│       SPATIAL CARDS 3D          │         │      INTERACTIVE CHAMBERS       │
│ • translateZ layered sheets     │         │ • Chamber 01: Search Terminal   │
│ • Hover pitch/roll transforms   │         │ • Chamber 02: Document Deck     │
│ • Multi-tier depth shadows      │         │ • Chamber 03: Ingestion Port    │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

- **Procedural Hero Canvas (`HeroScene.jsx`)**:
  - High-resolution procedural canvas textures producing infinite blueprint lines and dimensional measurement calipers.
  - Metallic orbital rings with delta-time spring physics responsive to mouse and pointer vectors.
  - Smooth camera translation linked to document scroll with `IntersectionObserver` viewport pausing.
- **Reusable Spatial Primitives (`FloatingSpace.jsx`)**:
  - `FloatingRing`: Perspective orbital rings with adjustable diameter, tilt axes, and dashed perimeter styling.
  - `FloatingFrame`: Dimensional coordinate bounding boxes displaying technical archive telemetry.
  - `FloatingGrid`: Receding 3D coordinate ground planes for visual depth.
  - `FloatingParticleField`: Ambient stardust particles drifting in the canvas background.
- **Multi-Layered Physical Document Cards (`SubjectCard.jsx`, `PaperCard.jsx`)**:
  - Tangible stacked backing sheets (`#070707`, `#0C0C0C`) creating realistic physical depth shadows.
  - Parallax layer separation on the Z-axis (`translateZ(12px) ... translateZ(24px)`).
  - Tactile open-preview animations on document selection.
- **Three-Chamber Architecture (`sections.jsx`)**:
  - **Chamber 01 (Discover)**: Interactive Search Terminal with blueprint gridlines.
  - **Chamber 02 (Retrieve)**: Layered Document Stack Deck with instant preview triggers.
  - **Chamber 03 (Contribute)**: Physical Vault Ingestion Port with animated submission apertures.

---

## 4. Key Implemented Features

### 🔍 Academic Paper Archive & Slot Search
- **Instant Keyword Search**: Real-time filtering across course titles, catalog codes (e.g. `CSE1007`, `MAT2001`, `ECE3002`), faculties, and exam years.
- **Exam Type Taxonomy**: Categorical segregation for **CAT-1**, **CAT-2**, **FAT**, and **Lab FAT**.
- **Slot Taxonomy**: Filter papers by institutional schedule slots (`A1`, `B1`, `C1`, `D1`, `E1`, `F1`, `G1`, `L1-L6`, etc.).

### 🤖 Gemini AI Paper Intelligence
- **Topic Weightage Distribution**: Automatically extracts and visualizes percentage-based module coverage from past question papers.
- **Recurring Question Detection**: Identifies repeated numericals, conceptual proofs, and problem patterns across multiple years.
- **High-Yield Revision Tips**: Provides concise bulleted study strategies for high-scoring efficiency.

### 🛡️ 4-Stage Ingestion & Duplicate Detection Pipeline
To maintain a clean and reliable archive, incoming submissions pass through an automated 4-tier cost-ladder check:
1. **SHA-256 Binary Hash Verification**: Instant cryptographic hash comparison against existing archive files.
2. **Metadata Tuple Matching**: Scans for conflicting submissions with identical `(subject, examType, year, slot)` attributes.
3. **Vector Embedding Cosine Similarity**: Evaluates semantic text similarity using `text-embedding-004` vectors against existing papers.
4. **Gemini Semantic Verdict**: For ambiguous similarity ranges (0.85 – 0.95), Gemini analyzes question ordering, marks allocation, and phrasing.

### 📄 WebWorker PDF Extraction Engine
- In-browser text parsing powered by `pdfjs-dist` (v6.4) running on an isolated Web Worker (`pdf.worker.min.mjs`).
- Extracts headings, questions, and metadata from uploaded documents without blocking the main UI thread or degrading 60/120 FPS animations.

### 📚 Syllabus & Course Notes Catalog
- Official curriculum tracking by module with download links to verified faculty lecture notes and study guides.

### 🛡️ Complete Administrator Console
- **Moderation Queue**: Real-time inspection, verification, and rejection of student paper submissions with built-in PDF preview.
- **Bulk Import Suite**: Offline archive migration tool reading bundled manifests and synchronizing records with Firestore.
- **Exam Countdown Configurator**: Real-time timer synchronized across all student views.
- **Subjects & Syllabus Manager**: Course catalog editor with code aliasing support.

### 💬 Community Discussion & Paper Requests
- Real-time subject discussion channels and upvoteable community paper request boards.

---

## 5. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | [React](https://react.dev) | `^19.2.8` | Component architecture & modern state primitives |
| **Routing** | [React Router](https://reactrouter.com) | `^7.18.4` | Single-page client-side routing & deep linking |
| **Build Engine** | [Vite](https://vitejs.dev) | `^8.3.0` | Rollup-powered bundling with Hot Module Replacement |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | `^4.3.3` | Utility-first styling & CSS 3D transform layers |
| **3D Graphics** | [Three.js](https://threejs.org) | `^0.186.1` | WebGL procedural geometry & spring physics |
| **Document Engine** | [PDF.js](https://mozilla.github.io/pdf.js/) | `^6.4.299` | Web Worker document rendering & text parsing |
| **Database & Auth** | [Firebase](https://firebase.google.com) | `^12.0.0` | Cloud Firestore & Google OAuth authentication |
| **Asset Storage** | [Cloudinary](https://cloudinary.com) | REST API | Raw PDF asset storage & CDN delivery |
| **AI & NLP** | [Google Gemini](https://ai.google.dev) | REST API | Embeddings (`text-embedding-004`) & Analysis |
| **Linter** | [Oxlint](https://oxc.rs) | `^1.81.0` | High-performance static code analysis |

---

## 6. Project Directory Structure

```text
PaperVault/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions automated deployment pipeline
├── public/
│   ├── images/
│   │   ├── papervault-logo.png       # Master 1024x1024 official brand emblem
│   │   ├── papervault-logo-tight.png # Framed 744x744 UI brand asset
│   │   ├── papervault-icon-192.png   # 192x192 PWA / Touch icon
│   │   └── papervault-icon-64.png    # 64x64 favicon raster source
│   ├── 404.html                  # SPA GitHub Pages redirect handler
│   ├── favicon.svg               # SVG brand favicon
│   ├── robots.txt                # Search engine crawler policies
│   └── sitemap.xml               # Prerendered archive sitemap
├── scripts/
│   ├── prerender-subjects.mjs    # Static prerender script for 19 core subject pages
│   └── update-icons.mjs          # SVG favicon builder
├── src/
│   ├── 3d/
│   │   ├── Card3D.jsx            # Perspective card wrapper with gyro/mouse tilt
│   │   ├── FloatingSpace.jsx     # Spatial 3D primitive library (Rings, Frames, Grids)
│   │   ├── HeroScene.jsx         # WebGL Three.js procedural blueprint scene
│   │   └── InteractiveVaultScene.jsx # 3D ingestion vault chamber
│   ├── ai/
│   │   ├── duplicateCheck.js     # 4-stage duplicate detection ladder
│   │   ├── gemini.js             # Gemini API client & cosine similarity
│   │   └── paperAnalysis.js      # Module weightage & revision tip generator
│   ├── components/
│   │   ├── 3d/                   # Component-level 3D scenes
│   │   ├── atoms.jsx             # Core design atoms (Button, Card, Badge, Gate)
│   │   ├── BrandLogo.jsx         # Official brand emblem component
│   │   ├── Icon.jsx              # Optimized inline SVG iconography
│   │   ├── Navbar.jsx            # Sticky frosted navigation bar with brand badge
│   │   ├── PaperCard.jsx         # Multi-layered 3D paper card
│   │   ├── SearchHero.jsx        # Spatial hero with terminal search
│   │   ├── sections.jsx          # Chamber sections (HowItWorks, UploadCta, Footer)
│   │   └── SubjectCard.jsx       # 3D interactive subject catalog card
│   ├── firebase/
│   │   ├── auth.js               # Google OAuth authentication handlers
│   │   ├── config.js             # Firebase client SDK initialization
│   │   └── db.js                 # Firestore collections & query methods
│   ├── hooks/
│   │   ├── useAuth.js            # User authentication state hook
│   │   ├── useChat.js            # Real-time discussion room hook
│   │   ├── usePapers.js          # Firestore papers query hook
│   │   ├── useSubjects.js        # Subject catalog hook
│   │   └── useSyllabus.js        # Course syllabus & notes hook
│   ├── lib/
│   │   └── cloudinary.js         # Cloudinary unsigned upload & raw delivery
│   ├── pages/
│   │   ├── admin/                # Admin Console (Dashboard, Moderation, BulkImport)
│   │   ├── Chat.jsx              # Community discussion channels
│   │   ├── Home.jsx              # Main landing page & curated archive discovery
│   │   ├── MyUploads.jsx         # Student contribution tracking
│   │   ├── PaperDetail.jsx       # Document viewer, AI insights, & similar papers
│   │   ├── Papers.jsx            # Catalog filtering & subject listing
│   │   ├── Requests.jsx          # Missing paper request board & voting
│   │   ├── Syllabus.jsx          # Curriculum modules & course notes
│   │   └── Upload.jsx            # Ingestion dropzone & validation pipeline
│   ├── utils/
│   │   ├── fileHash.js           # Browser-native Web Crypto SHA-256 calculation
│   │   ├── fileName.js           # Standardized paper naming utilities
│   │   ├── format.js             # Academic formatting & date helpers
│   │   └── pdfText.js            # WebWorker-accelerated PDF text extraction
│   ├── App.jsx                   # Route declarations & SEO metadata management
│   ├── index.css                 # Monochromatic design system & utilities
│   └── main.jsx                  # React application entry point
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies & execution scripts
└── vite.config.js                # Vite build configuration with manual chunking
```

---

## 7. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (Node 20+ recommended)
- **npm** or **pnpm** / **yarn**

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kunal4060/papervault.git
   cd papervault
   git checkout web
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Provide your project credentials:
   ```env
   # Firebase Web App Credentials
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Cloudinary Storage (Unsigned Preset for Raw PDFs)
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

   # Google Gemini API Key (Analysis & Vector Embeddings)
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/papervault/](http://localhost:5173/papervault/) in your browser.

---

## 8. Build & Verification Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement. |
| `npm run build` | Compiles production bundle and executes `scripts/prerender-subjects.mjs`. |
| `npm run lint` | Runs `oxlint` for high-speed JavaScript and JSX code validation. |
| `npm run preview` | Serves the production `dist/` directory locally. |

---

## 9. Performance & Accessibility Engineering

- **High-Refresh-Rate Display Optimization**:
  - Animations utilize `requestAnimationFrame` with delta-time calculation (`THREE.MathUtils.damp`) to guarantee identical physics across 60Hz, 90Hz, 120Hz, and 144Hz displays.
- **Viewport Culling & Resource Disposal**:
  - WebGL canvases use `IntersectionObserver` to halt rendering loops when scrolled out of view, conserving battery on portable devices.
- **Isolated PDF Chunking**:
  - `pdfjs-dist` is split into an independent bundle chunk (`pdfjs`) to prevent large PDF parsing runtimes from delaying initial page paint.
- **Reduced Motion Support**:
  - Fully supports `@media (prefers-reduced-motion: reduce)`. Decorative orbital rotations and parallax tilt effects are gracefully disabled while preserving complete functionality.
- **WebGL Fallback**:
  - Should WebGL context creation fail or be disabled in the client browser, a CSS grid backdrop is rendered automatically without throwing runtime exceptions.

---

## 10. License

This project is licensed under the [MIT License](LICENSE).

---

## Explore PaperVault

"Discover a more organized way to access academic resources."

### [Open the Live Website](https://kunal4060.github.io/papervault/)
