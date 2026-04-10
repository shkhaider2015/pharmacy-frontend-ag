# Build Pharmacy Desktop Frontend

This plan covers the development of a production-grade, visually stunning Desktop Application for a Pharmacy/Inventory Management System using Electron, React, TypeScript, and Vite.

## User Review Required

> [!WARNING]
> Please confirm if using the `electron-vite` template is acceptable for the standard Electron + React + Vite + TS scaffolding, or if you prefer a custom Vite build setup with Electron configured manually from scratch.

> [!NOTE]
> The backend URL configuration will be required later. I'll prepare the `axios` instance to use an environment variable or standard local port for development (`http://localhost:3000`).

## Proposed Changes

### 1. Scaffold & Initialization
- **Framework Setup**: Use `electron-vite` (a fast build tooling for Electron) with the React/TypeScript template to cleanly scaffold the app without prompts.
- **Dependencies**: Install required packages:
  - `react-router-dom` (routing)
  - `zustand` (state)
  - `@tanstack/react-query` (API fetching & caching state)
  - `axios` (API requests)
  - `lucide-react` or similar lightweight icon library (for sleek icons)
  - `recharts` or `chart.js` (for Dashboard charts)

### 2. Global Design System (Aesthetics)
- **CSS Strategy**: Implement Vanilla CSS (CSS Modules) primarily, with a global `index.css`.
- **Aesthetics Elements**:
  - CSS Variables for color palettes (sleek dark mode with vibrant accent colors).
  - Micro-animations and hover transitions for buttons, list items, and cards.
  - Glassmorphism effects using `backdrop-filter: blur()`.
  - Modern typography integration (e.g., Inter via Google Fonts).

### 3. Shared Components & Shell Layout
- **Layout Component**: A main layout shell consisting of a Sidebar navigation and a top Header (breadcrumbs, user profile).
- **Generic Data Table**: A robust data table component that automatically reads the `meta` pagination object (`total`, `page`, `limit`, `totalPages`) and renders modern pagination controls.
- **Form Controls**: Styled inputs, selects, and generic modals/side-drawers for Create/Edit views.

### 4. Global API/Auth Hooks
- **Axios Interceptor**: Setup `axios` instance to automatically attach the JWT token (stored securely via Zustand or Electron store) to every outgoing request.
- **Zustand Store**: Create `useAuthStore` to manage session info (token, user roles).

### 5. Screens to Develop
1. **Authentication**: Sleek, modern login screen.
2. **Dashboard**: Visual stats, quick expiry previews.
3. **Categories**: Generic CRUD views.
4. **Suppliers**: Supplier directory and management.
5. **Products & Ingredients**: CRUD interface.
6. **Inventory**: Special view emphasizing FEFO (`Expired`, `Near-Expiry` highlights).
7. **Users**: Role assignments.
8. **Orders**: Sales & Purchase interfaces.

---

## Open Questions
- Is there an existing set of brand colors or should I generate a premium dark mode palette (e.g. deep slate/blue backgrounds with vibrant indigo/emerald accents)?
- Should we use a specific charting library for the Dashboard (e.g., `recharts` vs `chart.js`)?

## Verification Plan
### Automated & Local Verification
- `npm run dev` to launch the Electron application locally.
- Verify hot-reloading works for renderer code.
### Manual Verification
- Visual inspection of the "Premium Design" criteria (colors, fonts, animations).
- Mocking the backend pagination API responses temporarily to ensure the dynamic pagination components correctly render page numbers, limit selectors, and change data appropriately.
