import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { db } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Generate order number like SS-10001
async function generateOrderNumber(): Promise<string> {
  const lastOrder = await db.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });

  let nextNumber = 10001;
  if (lastOrder?.orderNumber) {
    const match = lastOrder.orderNumber.match(/SS-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `SS-${nextNumber}`;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent ${paymentIntent.id} failed`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);

  // Check if order already exists (idempotency)
  const existingOrder = await db.order.findUnique({
    where: { stripePaymentId: session.payment_intent as string },
  });

  if (existingOrder) {
    console.log("Order already exists:", existingOrder.orderNumber);
    return;
  }

  // Extract order items from metadata
  const itemsJson = session.metadata?.items;
  const discountCodeStr = session.metadata?.discountCode;

  if (!itemsJson) {
    console.error("No items found in session metadata");
    return;
  }

  const items = JSON.parse(itemsJson) as {
    variantId: string;
    quantity: number;
  }[];

  // Get customer details
  const customerEmail = session.customer_details?.email || session.customer_email;
  // In Stripe API, shipping address is collected via shipping_address_collection
  // and returned as collected_shipping_details or shipping (depending on version)
  const shippingDetails = (session as unknown as { shipping_details?: { address?: Stripe.Address; name?: string } }).shipping_details
    || (session as unknown as { shipping?: { address?: Stripe.Address; name?: string } }).shipping;
  const shippingAddress = shippingDetails?.address;
  const customerName = shippingDetails?.name || session.customer_details?.name;

  if (!customerEmail) {
    console.error("No customer email found");
    return;
  }

  // Look up discount code if provided
  let discountCode = null;
  if (discountCodeStr) {
    discountCode = await db.discountCode.findUnique({
      where: { code: discountCodeStr },
    });
    if (discountCode) {
      // Increment usage count
      await db.discountCode.update({
        where: { id: discountCode.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  // Fetch variant details for order items
  const variantIds = items.map((i) => i.variantId);
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // Calculate subtotal
  let subtotal = 0;
  const orderItems = items.map((item) => {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      throw new Error(`Variant not found: ${item.variantId}`);
    }
    subtotal += variant.price * item.quantity;
    return {
      variantId: item.variantId,
      productId: variant.productId,
      quantity: item.quantity,
      price: variant.price,
      productName: variant.product.name,
      variantName: variant.name,
    };
  });

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create the order
  const order = await db.order.create({
    data: {
      orderNumber,
      stripePaymentId: session.payment_intent as string,
      status: "PAID",
      email: customerEmail,
      phone: session.customer_details?.phone || null,
      shippingAddress: {
        name: customerName,
        line1: shippingAddress?.line1,
        line2: shippingAddress?.line2 || null,
        city: shippingAddress?.city,
        state: shippingAddress?.state,
        postalCode: shippingAddress?.postal_code,
        country: shippingAddress?.country || "US",
      },
      subtotal,
      shipping: (session.amount_total || 0) - subtotal - (session.total_details?.amount_tax || 0),
      tax: session.total_details?.amount_tax || 0,
      discount: discountCode ? (session.total_details?.amount_discount || 0) : 0,
      total: session.amount_total || 0,
      discountCodeId: discountCode?.id || null,
      items: {
        create: orderItems,
      },
    },
  });

  // Update inventory for each item
  for (const item of items) {
    await db.productVariant.update({
      where: { id: item.variantId },
      data: {
        inventory: { decrement: item.quantity },
      },
    });
  }

  console.log("Order created successfully:", order.orderNumber);
}
