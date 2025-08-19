import axios from "axios";
import { useEffect } from "react";

export default function Checkout() {    
  const startCheckout = async () => {
    try {
      // Call your backend to create a Safepay order
      const { data } = await axios.post("http://localhost:5000/api/create-order", {
        amount: 5000, // PKR 50
        currency: "PKR",
        source: "custom-checkout"
      });

      // Load safepay.js
      const script = document.createElement("script");
      script.src = "https://cdn.gosafepay.com/safepay.js";
      script.onload = () => {
        // @ts-ignore
        window.Safepay.checkout({
          env: "sandbox", // or production
          amount: data.amount,
          currency: "PKR",
          client: data.client,
          orderId: data.orderId
        });
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  return <button onClick={startCheckout}>Pay with Safepay</button>;
}
