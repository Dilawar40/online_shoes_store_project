import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = body.amount || 1000; // paisa
    console.log("Safepay amount:", amount);

    // 1) Get Payment Token
    const tokenRes = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SAFEPAY_V1_SECRET}`,
      },
      body: JSON.stringify({
        amount,
        currency: process.env.SAFEPAY_CURRENCY || "PKR",
        client: process.env.SAFEPAY_CLIENT,
        environment: process.env.SAFEPAY_ENVIRONMENT || "sandbox",
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("Safepay Token Response:", tokenRes.status, tokenData);

    if (!tokenData?.data?.token) {
      return NextResponse.json(
        { error: "Could not create payment token", raw: tokenData },
        { status: 400 }
      );
    }

    // 2) Redirect to hosted checkout
    const checkoutUrl = `https://sandbox.getsafepay.com/checkout/${tokenData.data.token}`;
    return NextResponse.json({ redirect: checkoutUrl });
  } catch (err) {
    console.error("Safepay error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
