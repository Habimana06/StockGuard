import { Button } from "../components/Button";
import { CheckoutSection } from "../components/drop/CheckoutSection";
import { DropStepGuide } from "../components/drop/DropStepGuide";
import { OrderSummary } from "../components/drop/OrderSummary";
import { ProductImage } from "../components/drop/ProductImage";
import { ProductSpecs } from "../components/drop/ProductSpecs";
import { StockMeter } from "../components/drop/StockMeter";
import { AppShell } from "../components/layout/AppShell";
import { Alert } from "../components/ui/Alert";
import { CopyChip } from "../components/ui/CopyChip";
import { LiveIndicator } from "../components/ui/LiveIndicator";
import { DropPageSkeleton } from "../components/ui/Skeleton";
import { useProductDrop } from "../hooks/useProductDrop";
import type { DropPhase } from "../hooks/useProductDrop";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function statusLabel(phase: DropPhase): string {
  switch (phase) {
    case "idle":
      return "Available";
    case "reserved":
    case "checking-out":
      return "Reserved — checkout open";
    case "sold-out":
      return "Sold out";
    case "purchased":
      return "Order confirmed";
    case "expired":
      return "Reservation expired";
    case "error":
      return "Connection issue";
    default:
      return "Available";
  }
}

export function LimitedDropPage() {
  const {
    product,
    reservation,
    phase,
    errorMessage,
    orderId,
    paymentLabel,
    isInitialLoading,
    isRefreshing,
    isReserving,
    isOnline,
    lastRefreshedAt,
    reserve,
    checkout,
    onExpired,
    dismissError,
    reload,
  } = useProductDrop();

  if (isInitialLoading && !product) {
    return (
      <AppShell>
        <DropPageSkeleton />
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell online={false}>
        <div className="state-empty">
          <Alert variant="error" title="Drop unavailable">
            {errorMessage ?? "We could not load the product. Is the API running?"}
          </Alert>
          <Button variant="secondary" onClick={() => void reload()}>
            Try again
          </Button>
        </div>
      </AppShell>
    );
  }

  const soldOut = product.availableStock <= 0 && !reservation;
  const canReserve =
    !soldOut &&
    !reservation &&
    phase !== "purchased" &&
    phase !== "checking-out" &&
    phase !== "expired";
  const showCheckout =
    reservation != null && (phase === "reserved" || phase === "checking-out");
  const qty = reservation?.quantity ?? 1;

  return (
    <AppShell online={isOnline}>
      <div className="drop-page">
        <header className="drop-page__header">
          <div>
            <p className="drop-page__eyebrow">Official limited release</p>
            <h1 className="drop-page__title">{product.name}</h1>
            {product.description ? (
              <p className="drop-page__desc">{product.description}</p>
            ) : null}
          </div>
          <div className="drop-page__meta">
            <span className={`status-chip status-chip--${phase}`}>
              {statusLabel(phase)}
            </span>
            <LiveIndicator
              isRefreshing={isRefreshing}
              lastRefreshedAt={lastRefreshedAt}
            />
          </div>
        </header>

        <div className="drop-page__grid">
          <section className="drop-page__gallery">
            <ProductImage src={product.imageUrl} alt={product.name} />
            <ProductSpecs totalStock={product.totalStock} />
          </section>

          <section className="drop-page__purchase">
            <div className="purchase-panel">
              <div className="purchase-panel__price-block">
                <p className="purchase-panel__price">{formatPrice(product.priceCents)}</p>
                <p className="purchase-panel__note">Free shipping · 1 unit per customer</p>
              </div>

              <StockMeter
                available={product.availableStock}
                total={product.totalStock}
              />

              {showCheckout && reservation ? (
                <CheckoutSection
                  expiresAt={reservation.expiresAt}
                  productName={product.name}
                  priceCents={product.priceCents}
                  quantity={qty}
                  reservationId={reservation.id}
                  isCheckingOut={phase === "checking-out"}
                  onCheckout={(payment) => void checkout(payment)}
                  onExpired={onExpired}
                />
              ) : (
                <>
                  {phase === "expired" ? (
                    <Alert variant="warning" title="Reservation expired">
                      Your 5-minute hold ended. Stock was released — reserve again if units
                      are still available.
                    </Alert>
                  ) : null}

                  {phase === "purchased" && orderId ? (
                    <div className="success-panel">
                      <Alert variant="success" title="Payment successful">
                        <span>Thank you! Your order is confirmed.</span>
                        {paymentLabel ? (
                          <p className="payment-receipt">
                            Paid via <strong>{paymentLabel}</strong>
                          </p>
                        ) : null}
                        <CopyChip label="Order ID" value={orderId} />
                      </Alert>
                      <OrderSummary
                        productName={product.name}
                        priceCents={product.priceCents}
                        quantity={qty}
                      />
                      <Button variant="secondary" onClick={() => void reload()}>
                        Back to drop
                      </Button>
                    </div>
                  ) : null}

                  {!isOnline ? (
                    <Alert variant="warning" title="Network issue">
                      Could not reach the server. Stock may be outdated until connection
                      returns.
                    </Alert>
                  ) : null}

                  {errorMessage ? (
                    <Alert variant="error" title="Action failed" onDismiss={dismissError}>
                      {errorMessage}
                    </Alert>
                  ) : null}

                  {phase !== "purchased" ? (
                    <div className="purchase-panel__actions">
                      <Button
                        variant="primary"
                        size="lg"
                        loading={isReserving}
                        disabled={!canReserve || soldOut}
                        onClick={() => void reserve()}
                      >
                        {soldOut ? "Sold out" : isReserving ? "Reserving…" : "Reserve now"}
                      </Button>
                      <p className="purchase-panel__reserve-hint">
                        After reserving, a 5-minute countdown starts — complete checkout before
                        it expires.
                      </p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>

        <DropStepGuide />
      </div>
    </AppShell>
  );
}
