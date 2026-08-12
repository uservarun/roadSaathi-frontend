# RoadSaathi — Frontend

React (Vite) frontend for the RoadSaathi road-safety backend. Talks to six
backend endpoint groups: auth, routing, issues (potholes/gates), trips (live
telemetry), commutes, and the government/audit dashboard. Maps are powered
by the Google Maps JavaScript API.

## ⚠️ Backend coverage note

The backend API spec documents more than the current backend build actually
implements. As of this update:

**Implemented in the backend and fully wired up here:** signup, login,
verify email, routing/calculate, issues/report, issues/gate, issues/nearby,
trips/telemetry.

**Documented in the spec but *not yet* built into the backend** — this
frontend calls these against the spec'd paths, so the UI (resend code,
forgot/reset password, saved commutes, the government dashboard) is ready
the moment the backend ships them, but **will error with a 404 until then**:
- `POST /api/v1/auth/resend-code`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/commutes`, `GET /api/v1/commutes/user/{userId}`, `DELETE /api/v1/commutes/{id}`
- `GET /api/v1/issues/all`, `PUT /api/v1/issues/pothole/{id}/status`, `PUT /api/v1/issues/alert/{id}/status`

## 1. Run the backend first

This frontend does nothing without the Spring Boot backend running at
`http://localhost:8080` (or wherever you configure it). From the backend repo:

```bash
./mvnw spring-boot:run
```

Make sure these environment variables are set for the backend (see its
`application.properties`): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
`BREVO_SMTP_USERNAME`, `BREVO_SMTP_PASSWORD`, `BREVO_SENDER_EMAIL`, and
optionally `GEMINI_API_KEY` for AI pothole verification.

## 2. Set up this frontend

```bash
# from this project's root folder
cp .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

If your backend runs somewhere other than `localhost:8080`, edit
`VITE_API_BASE_URL` in `.env`.

### Get a Google Maps API key

The map views (**Plan route**, **Nearby hazards**) need a Google Maps
JavaScript API key. Without one they show a placeholder instead of a map —
everything else in the app still works.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   sign in (create a free account if you don't have one — no cost to start;
   Google gives a recurring monthly credit that covers typical dev usage).
2. Create a new project (or pick an existing one).
3. Go to **APIs & Services → Library**, search for **"Maps JavaScript API"**,
   and click **Enable**.
4. Go to **APIs & Services → Credentials → Create Credentials → API key**.
   Copy the key it generates.
5. (Recommended) Click into the new key and under **Application restrictions**
   choose **HTTP referrers**, then add `http://localhost:5173/*` (and your
   production domain later) so the key can't be used elsewhere.
6. Paste it into `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here
   ```
7. Restart `npm run dev`.

Google requires a billing account to be linked to create a key, but the
Maps JavaScript API has a free monthly usage allowance that covers normal
development and small-scale use — you won't be charged unless you exceed it.

## 3. Try it out

1. Go to **Sign up**, create an account. The backend emails a 6-digit code
   (via Brevo SMTP) — enter it on the **Verify email** screen.
2. Log in.
3. **Plan route**: click the map once to set a start point, click again for
   your destination, then "Calculate route". You'll get up to 3 alternatives
   scored by a safety score, distance, and known hazards along the path.
4. **Nearby hazards**: view potholes and alerts around any point on the map.
5. **Report issue**: report a pothole (optionally with a photo — AI
   verification kicks in automatically if `GEMINI_API_KEY` is set on the
   backend) or update a railway gate's status.
6. **Live trip**: streams your live location to the backend every few
   seconds while tracking is on — this is what auto-detects a closed gate
   when multiple users are stopped near one.
7. **Commutes** *(needs backend support — see coverage note above)*: on the
   Plan route screen, once you've set a start and end point, "Save commute"
   stores it; manage saved commutes on the **Commutes** page.
8. **Government dashboard** *(needs backend support — see coverage note
   above)*: view every reported pothole/alert and change their status.
9. **Forgot / reset password** *(needs backend support — see coverage note
   above)*: "Forgot password?" on the login screen sends a reset code;
   redeem it on the reset password screen. **Resend code** is also
   available on the verify-email screen (60s cooldown, matching the
   backend's rate limit).

## Project structure

```
src/
  api/          one file per backend controller (auth, routing, issues,
                trips, commutes, government)
  context/      AuthContext (JWT + user, persisted to localStorage) and
                GoogleMapsProvider (loads the Maps JS API once, app-wide)
  components/   NavBar, ProtectedRoute, SafetyGauge, RouteResultCard, MapStatus
  pages/        one page per screen (Login, Signup, VerifyEmail,
                ForgotPassword, ResetPassword, PlanRoute, Dashboard,
                ReportIssue, LiveTrip, Commutes, GovernmentDashboard)
  utils/wkt.js       parses the WKT strings the backend returns for geometry
  utils/mapStyle.js  dark Google Maps theme matching the app's look
```

## Notes / gotchas carried over from the backend

- The backend's JWT signing key is generated **in memory at startup** —
  restarting the backend invalidates every existing session. If login
  suddenly stops working, just log in again.
- `/api/v1/routing/**` and `/api/v1/issues/**` are currently public on the
  backend (`permitAll()`), even though this frontend gates them behind login
  for a coherent UX. `/api/v1/trips/**` is the one endpoint that actually
  requires the JWT.
- Pothole and gate reports are rate-limited to one every 5 minutes per user
  — the backend returns a clear error message if you're too early.
- Gate status updates are only accepted within 50 meters of an existing gate
  alert (or create a new one if none exists nearby).
