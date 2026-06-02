interface ProductSpecsProps {
  totalStock: number;
}

const specs = [
  { label: "Color", value: "Arctic White" },
  { label: "Batch size", value: "10 units" },
  { label: "Hold time", value: "5 minutes" },
  { label: "Limit", value: "1 per customer" },
];

export function ProductSpecs({ totalStock }: ProductSpecsProps) {
  return (
    <dl className="product-specs">
      {specs.map((s) => (
        <div key={s.label} className="product-specs__row">
          <dt>{s.label}</dt>
          <dd>{s.label === "Batch size" ? `${totalStock} units` : s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
