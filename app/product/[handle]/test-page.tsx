import { notFound } from "next/navigation";
import { staticProducts } from "@/app/lib/constants";

export default function TestPage({ params }: { params: { handle: string } }) {
  const product = staticProducts.find((p) => p.handle === params.handle);
  if (!product) return notFound();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <p className="mt-4">{product.description}</p>
    </div>
  );
}
