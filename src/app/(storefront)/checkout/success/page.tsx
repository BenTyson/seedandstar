"use client";

import { useEffect, useState } from "react";
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
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
  const [orderNumber] = useState(() =>
    `SS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  );

  useEffect(() => {
    // Celebration confetti on page load
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#a78bfa", "#1e3a5f", "#5eead4", "#9ca37c", "#fbbf24"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#a78bfa", "#1e3a5f", "#5eead4", "#9ca37c", "#fbbf24"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
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
