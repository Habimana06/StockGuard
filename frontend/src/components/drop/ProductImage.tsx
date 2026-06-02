interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80";

export function ProductImage({ src, alt }: ProductImageProps) {
  return (
    <figure className="product-image">
      <img
        src={src ?? FALLBACK}
        alt={alt}
        loading="eager"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = FALLBACK;
        }}
      />
      <figcaption className="product-image__badge">Limited drop</figcaption>
    </figure>
  );
}
