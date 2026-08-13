# RoadSathi — Frontend

React (Vite) frontend for the RoadSathi safe road travel assistant. Connects to the Spring Boot Java backend to plan routes based on safety ratings, view nearby hazards, report potholes, stream telemetry, and access the government audit panel.

---

## 🗺️ Free Map Integration (Keyless)
Unlike standard clones that require Google Maps billing setup, **RoadSathi's maps are powered by Leaflet & OpenStreetMap (CartoDB Voyager)**:
*   **100% Free & Open-source:** No credit card, Google Cloud billing, or API keys required.
*   **Fully Interactive:** Click to set Start (A) and Destination (B) points, view custom orange/red hazard markers, and open popups with details.
*   **Responsive Scaling:** The map bounds automatically adjust to fit the calculated route paths dynamically.

---

## 🚀 Setup & Installation

### 1. Configure Environment Variables
Create a `.env` file in the root of the frontend folder:
```env
VITE_API_BASE_URL=http://localhost:8080
```
*(If your backend is hosted on Render, change the URL to your Render deployment URL, e.g. `https://your-backend-api.onrender.com`)*

### 2. Run in Development Mode
Run the following commands in your terminal:
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🛡️ Completed Features & API Coverage
Every endpoint is fully implemented, wired up, and secured:

1.  **Safety Routing (`/plan`):** Computes up to 3 alternative paths scored by distance and known hazards (potholes, closed gates) using PostGIS spatial algorithms.
2.  **Nearby Hazards (`/hazards`):** Scans and plots potholes (orange diamonds) and active alerts (red circles) within a custom radius.
3.  **Incident Reporting (`/report`):** Report potholes with photos (AI-analyzed by Gemini on the backend) or update gate statuses. Restricted by $50\text{m}$ geofencing to prevent fake reports.
4.  **Live Telemetry (`/trip`):** Streams speed telemetry to detect closed railway crossings based on citizen traffic slowdowns.
5.  **My Commutes (`/commutes`):** Save and delete regular routes. Secured using Spring Security JWT authentication.
6.  **Government Dashboard (`/government`):** Secure audit grid for municipal admin overrides. **Strictly protected: regular users are redirected back to the plan page on the client, and requests are blocked on the server with 403 checks.**

---

## 📂 Project Structure
*   `src/api/` - HTTP client calls grouped by controller (auth, routing, issues, trips, commutes, government).
*   `src/context/` - `AuthContext.jsx` storing JWT sessions and user roles (`USER` / `ADMIN`).
*   `src/components/` - Common UI elements (Navbar, ProtectedRoute, SafetyGauge, RouteResultCards).
*   `src/pages/` - Application view pages.
*   `src/utils/useDocumentTitle.js` - Custom SEO page title manager.
*   `src/utils/wkt.js` - Utility to convert WKT (Well-Known Text) spatial geometry formats into coordinate arrays.
