// components/ProductCard.tsx
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage: { url: string; altText: string | null };
    variants: { edges: { node: { price: { amount: string } } }[] };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.featuredImage?.url;
  const altText = product.featuredImage?.altText || product.title;
  const price = product.variants.edges[0].node.price.amount;

  return (
    <div className="border rounded-lg shadow hover:shadow-md transition overflow-hidden bg-white">
      <img src={imageUrl} alt={altText} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">{product.title}</h2>
        <p className="text-green-600 font-bold mb-2">{price} грн</p>
        <Link
          href={`/shop/${product.handle}`}
          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
