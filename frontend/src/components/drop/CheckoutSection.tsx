import { Button } from "../Button";
import { usePaymentForm } from "../../hooks/usePaymentForm";
import type { CheckoutPaymentPayload } from "../../types/payment";
import { CountdownPanel } from "./CountdownPanel";
import { OrderSummary } from "./OrderSummary";
import { PaymentForm } from "./PaymentForm";

interface CheckoutSectionProps {
  expiresAt: string;
  productName: string;
  priceCents: number;
  quantity: number;
  reservationId: string;
  isCheckingOut: boolean;
  onCheckout: (payment: CheckoutPaymentPayload) => void;
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
  const paymentForm = usePaymentForm(reservationId);

  const handlePay = () => {
    paymentForm.markTouched();
    const payload = paymentForm.buildPayload();
    if (payload) {
      onCheckout(payload);
    }
  };

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
          <span className="checkout-step__text">Pay</span>
        </div>
      </div>

      <CountdownPanel expiresAt={expiresAt} onExpired={onExpired} />

      <PaymentForm form={paymentForm} />

      <div className="checkout-flow__card">
        <div className="checkout-flow__total-row">
          <div>
            <p className="checkout-flow__total-label">Amount due</p>
            <p className="checkout-flow__total">{formatPrice(total)}</p>
          </div>
          <p className="checkout-flow__secure">Encrypted · PCI-style demo</p>
        </div>

        <Button
          variant="checkout"
          size="lg"
          loading={isCheckingOut}
          disabled={!paymentForm.isValid}
          onClick={handlePay}
        >
          {isCheckingOut
            ? "Processing payment…"
            : `Pay ${formatPrice(total)} now`}
        </Button>

        {!paymentForm.isValid && paymentForm.touched ? (
          <p className="checkout-flow__validation-hint">
            Fill in all required payment fields above to continue.
          </p>
        ) : null}

        <p className="checkout-flow__fine">
          Payment is simulated for this demo. Stock is held under reservation{" "}
          <span className="checkout-flow__ref">{reservationId.slice(0, 8)}…</span>.
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
