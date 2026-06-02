interface OrderSummaryProps {
  productName: string;
  priceCents: number;
  quantity: number;
  reservationId?: string;
  showCheckoutHint?: boolean;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function OrderSummary({
  productName,
  priceCents,
  quantity,
  reservationId,
  showCheckoutHint,
}: OrderSummaryProps) {
  const total = priceCents * quantity;

  return (
    <aside className="order-summary" aria-label="Order summary">
      <h2 className="order-summary__title">Order summary</h2>
      <ul className="order-summary__lines">
        <li>
          <span>{productName}</span>
          <span>{formatPrice(priceCents)}</span>
        </li>
        <li>
          <span>Quantity</span>
          <span>{quantity}</span>
        </li>
        <li className="order-summary__total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </li>
      </ul>
      {reservationId ? (
        <div className="order-summary__ref">
          <span className="order-summary__ref-label">Reservation ID</span>
          <code>{reservationId}</code>
        </div>
      ) : null}
      {showCheckoutHint ? (
        <p className="order-summary__hint">
          Complete checkout before the timer ends or your unit goes back to the pool.
        </p>
      ) : null}
    </aside>
  );
}
