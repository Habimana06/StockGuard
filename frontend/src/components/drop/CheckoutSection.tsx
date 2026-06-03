import { Button } from "../Button";
import { CountdownPanel } from "./CountdownPanel";
import { OrderSummary } from "./OrderSummary";

interface CheckoutSectionProps {
  expiresAt: string;
  productName: string;
  priceCents: number;
  quantity: number;
  reservationId: string;
  isCheckingOut: boolean;
  onCheckout: () => void;
  onExpired: () => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function CheckoutSection({
  expiresAt,
  productName,
  priceCents,
  quantity,
  reservationId,
  isCheckingOut,
  onCheckout,
  onExpired,
}: CheckoutSectionProps) {
  const total = priceCents * quantity;

  return (
    <section className="checkout-flow" aria-label="Checkout">
      <div className="checkout-flow__steps">
        <div className="checkout-step checkout-step--done">
          <span className="checkout-step__icon" aria-hidden>
            ✓
          </span>
          <span className="checkout-step__text">Reserved</span>
        </div>
        <div className="checkout-step__line" aria-hidden />
        <div className="checkout-step checkout-step--current">
          <span className="checkout-step__icon" aria-hidden>
            2
          </span>
          <span className="checkout-step__text">Pay now</span>
        </div>
      </div>

      <CountdownPanel expiresAt={expiresAt} onExpired={onExpired} />

      <div className="checkout-flow__card">
        <div className="checkout-flow__total-row">
          <div>
            <p className="checkout-flow__total-label">Amount due</p>
            <p className="checkout-flow__total">{formatPrice(total)}</p>
          </div>
          <p className="checkout-flow__secure">Secure checkout</p>
        </div>

        <Button
          variant="checkout"
          size="lg"
          loading={isCheckingOut}
          onClick={onCheckout}
        >
          {isCheckingOut ? "Processing…" : `Complete checkout · ${formatPrice(total)}`}
        </Button>

        <p className="checkout-flow__fine">
          By completing checkout you confirm your order. Stock is already held under
          reservation <span className="checkout-flow__ref">{reservationId.slice(0, 8)}…</span>.
        </p>
      </div>

      <OrderSummary
        productName={productName}
        priceCents={priceCents}
        quantity={quantity}
        reservationId={reservationId}
        variant="compact"
      />
    </section>
  );
}
