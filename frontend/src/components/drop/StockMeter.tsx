interface StockMeterProps {
  available: number;
  total: number;
}

export function StockMeter({ available, total }: StockMeterProps) {
  const soldOut = available <= 0;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const low = available > 0 && available <= Math.max(2, Math.floor(total * 0.2));

  return (
    <div className={`stock-meter ${soldOut ? "stock-meter--sold-out" : ""} ${low ? "stock-meter--low" : ""}`}>
      <div className="stock-meter__header">
        <span className="stock-meter__label">Units left</span>
        <span className="stock-meter__count">
          {soldOut ? (
            <strong>Sold out</strong>
          ) : (
            <>
              <strong>{available}</strong>
              <span className="stock-meter__of"> / {total}</span>
            </>
          )}
        </span>
      </div>
      <div className="stock-meter__track" role="progressbar" aria-valuenow={available} aria-valuemin={0} aria-valuemax={total}>
        <div
          className="stock-meter__fill"
          style={{ width: `${soldOut ? 0 : pct}%` }}
        />
      </div>
      {low && !soldOut ? (
        <p className="stock-meter__hint">Almost gone — reserve now</p>
      ) : null}
    </div>
  );
}
