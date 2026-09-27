import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderMenu } from "./order-menu";

export const metadata: Metadata = {
  title: "Order Online",
  description: "Order Vintage Pizza online for pickup or delivery — pizza, specialty pies, subs, tenders, wings, salads and more.",
};

export default function OrderPage() {
  return (
    <Suspense>
      <OrderMenu />
    </Suspense>
  );
}
