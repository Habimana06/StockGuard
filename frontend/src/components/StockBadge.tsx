interface StockBadgeProps {
  available: number;
  total: number;
}

export function StockBadge({ available, total }: StockBadgeProps) {
  const soldOut = available <= 0;
  return (
    <div className={`stock-badge ${soldOut ? "stock-badge--empty" : ""}`}>
      <span className="stock-badge__label">Remaining</span>
      <span className="stock-badge__value">
        {soldOut ? "Sold out" : `${available} / ${total}`}
      </span>
    </div>
  );
}
