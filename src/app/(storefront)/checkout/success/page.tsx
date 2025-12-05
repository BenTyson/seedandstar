export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Package,
  Mail,
  ArrowRight,
  Truck,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { ConfettiEffect } from "./confetti-effect";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id } = await searchParams;

  let orderNumber = "Processing...";

  if (session_id) {
    try {
      // Try to get order from database first
      const order = await db.order.findFirst({
        where: { stripePaymentId: session_id },
        select: { orderNumber: true },
      });

      if (order) {
        orderNumber = order.orderNumber;
      } else {
        // Fallback: get payment intent from Stripe session
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_intent) {
          const order = await db.order.findFirst({
            where: { stripePaymentId: session.payment_intent as string },
            select: { orderNumber: true },
          });
          if (order) {
            orderNumber = order.orderNumber;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <ConfettiEffect />

      {/* Success Icon */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-retro-sage/20" />
        <CheckCircle2 className="relative h-20 w-20 text-retro-sage" />
      </div>

      {/* Success Message */}
      <h1 className="mb-2 text-center font-display text-3xl font-bold md:text-4xl">
        Order Confirmed!
      </h1>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Thank you for your order. We&apos;re getting your delicious dip mixes ready
        for shipment.
      </p>

      {/* Order Number */}
      <Card className="mb-8 w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono text-lg font-bold">{orderNumber}</p>
            </div>
            <Package className="h-8 w-8 text-retro-lavender" />
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="mb-8 w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">
            What&apos;s Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-retro-teal" />
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive an email confirmation with your order details
                  shortly.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-retro-gold" />
              <div>
                <p className="font-medium">Processing Time</p>
                <p className="text-sm text-muted-foreground">
                  Orders are typically processed within 24 hours.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 text-retro-lavender" />
              <div>
                <p className="font-medium">Shipping Updates</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            Back to Home
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Support Note */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Questions about your order?{" "}
        <Link href="/contact" className="text-retro-lavender hover:underline">
          Contact us
        </Link>
      </p>
    </div>
  );
}
