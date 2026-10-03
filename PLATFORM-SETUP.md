# Aswal Tour & Travels — Platform Setup

Implemented: customer booking experience, India-wide location autocomplete, dynamic route/fare architecture, vehicle autocomplete, WhatsApp handoff, booking confirmation, admin operations UI, driver/vehicle UI, Supabase/PostgreSQL schema, route-specific SEO pages, mobile responsive design.

## Smart location + route architecture

The public site is intentionally static on GitHub Pages. Google Places (New) Autocomplete and Google Routes API are called through a Supabase Edge Function so the Google API key never appears in HTML/CSS/JavaScript.

1. Create/enable a Google Cloud project with **Places API (New)** and **Routes API**.
2. Create a server-side Google Maps Platform API key.
3. In Supabase, deploy `supabase/functions/google-maps-proxy/index.ts`.
4. Set the secret:
   `supabase secrets set GOOGLE_MAPS_API_KEY=YOUR_KEY`
5. Restrict the Google key to the required APIs and your production usage/quota.
6. Set `ASWAL_ALLOWED_ORIGIN` to the exact GitHub Pages origin (for example `https://anirudhpratapsinghmba-source.github.io`), then deploy.
7. Put only the public Edge Function URL in `aswal-config.js`:
   `window.ASWAL_CONFIG = { mapsProxy: "https://YOUR_PROJECT_REF.supabase.co/functions/v1/google-maps-proxy" };`

If `mapsProxy` is empty/unavailable, the UI falls back to the curated India city dataset for suggestions. It only uses the existing Haridwar legacy route benchmark when that exact route is known; otherwise it refuses to fabricate a distance/fare and shows **Estimated route unavailable — contact travel desk for quote.**

## API contract

The Edge Function accepts POST JSON:
- `{ action: "autocomplete", input, sessionToken }`
- `{ action: "details", placeId, sessionToken }`
- `{ action: "route", origin: { placeId, lat, lng }, destination: { placeId, lat, lng } }`

It returns normalized place details and route `distanceKm` / `durationSeconds` for the frontend.

## Vehicle catalogue

`supabase-schema.sql` extends the existing vehicles table with manufacturer, model, full_name, category, fuel_type, transmission, luggage_capacity and minimum_booking_rate. Seed entries are based on current manufacturer catalogues; Aswal per-km/minimum rates are business configuration, not manufacturer prices.

## Fare formula

`distance × vehicle rate + driver + toll + parking`, with round-trip distance doubled. Displayed fares are indicative until an operator confirms route, vehicle, dates and inclusions.

## Security

No Google secret is stored in the GitHub repository. `aswal-config.js` contains only a public Edge Function URL. For production, keep the Google key in Supabase secrets, restrict the key to Places/Routes APIs, set request quotas, and restrict the Edge Function's allowed origin.

Brand: **Aswal Tour & Travels**. “Haridwar Yatra Traveller” is a service concept/location descriptor, not a separate customer-facing brand.