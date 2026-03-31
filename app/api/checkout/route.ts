import Stripe from "stripe";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return Response.json(
        { error: "Stripe ej konfigurerad" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);
    const { userId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: "Tidsapp Pro",
              description: "Obegränsade tidsposter och premiumfunktioner",
            },
            unit_amount: 5000, // 50 kr/månad
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/?upgraded=true`,
      cancel_url: `${req.nextUrl.origin}/`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { error: "Kunde inte skapa checkout" },
      { status: 500 }
    );
  }
}
