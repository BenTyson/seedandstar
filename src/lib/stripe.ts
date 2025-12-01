import Stripe from "stripe";

// Allow build without env var - use placeholder that will fail at runtime
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_placeholder_for_build";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});
