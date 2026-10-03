# Aswal Tour & Travels — Platform Setup

Implemented: customer booking experience, fare calculator, WhatsApp handoff, booking confirmation, admin operations UI, driver/vehicle UI, Supabase/PostgreSQL schema, route-specific SEO pages, mobile responsive design.

Production note: GitHub Pages can host the public static experience, but persistent bookings, authentication, secure payments and automated SMS/email require a backend/serverless deployment. Recommended production stack: Supabase Auth + PostgreSQL + Storage, server-side API/Edge Functions, Razorpay for INR/UPI payments, and an approved messaging/email provider. Secrets must remain in deployment environment variables.

Fare formula: distance × vehicle rate + driver + toll + parking − discount. Displayed fares are indicative until an operator confirms route, vehicle, dates and inclusions.

Brand: **Aswal Tour & Travels**. “Haridwar Yatra Traveller” is a service concept/location descriptor, not a separate customer-facing brand.