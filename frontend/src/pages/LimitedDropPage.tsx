import { Button } from "../components/Button";
import { CountdownPanel } from "../components/drop/CountdownPanel";
import { DropStepGuide } from "../components/drop/DropStepGuide";
import { StockMeter } from "../components/drop/StockMeter";
import { AppShell } from "../components/layout/AppShell";
import { Alert } from "../components/ui/Alert";
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
      return "Open";
    case "reserved":
    case "checking-out":
      return "Held for you";
    case "sold-out":
      return "Sold out";
    case "purchased":
      return "Confirmed";
    case "expired":
      return "Expired";
    case "error":
      return "Error";
    default:
      return "Open";
  }
}

export function LimitedDropPage() {
  const {
    product,
    reservation,
    phase,
    errorMessage,
    orderId,
    isInitialLoading,
    isRefreshing,
    isReserving,
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
      <AppShell>
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

  return (
    <AppShell>
      <div className="drop-layout">
        <section className="drop-hero">
          <div className="drop-hero__top">
            <span className={`status-chip status-chip--${phase}`}>
              {statusLabel(phase)}
            </span>
            <LiveIndicator
              isRefreshing={isRefreshing}
              lastRefreshedAt={lastRefreshedAt}
            />
          </div>

          <h1 className="drop-hero__title">{product.name}</h1>
          {product.description ? (
            <p className="drop-hero__desc">{product.description}</p>
          ) : null}
        </section>

        <article className="product-card">
          <div className="product-card__visual">
            <div className="product-card__glow" aria-hidden />
            <div className="product-card__shoe" aria-hidden>
              <span className="product-card__mark">01</span>
              <span className="product-card__edition">Limited release</span>
            </div>
          </div>

          <div className="product-card__body">
            <div className="product-card__price-row">
              <p className="product-card__price">{formatPrice(product.priceCents)}</p>
              <p className="product-card__price-note">Tax included · 1 per customer</p>
            </div>

            <StockMeter
              available={product.availableStock}
              total={product.totalStock}
            />

            {reservation && phase !== "purchased" ? (
              <CountdownPanel
                expiresAt={reservation.expiresAt}
                onExpired={onExpired}
              />
            ) : null}

            {phase === "expired" ? (
              <Alert variant="warning" title="Reservation expired">
                Your 5-minute hold ended and stock was released. Grab another pair if any
                are still showing.
              </Alert>
            ) : null}

            {phase === "purchased" && orderId ? (
              <Alert variant="success" title="You're in!">
                Order <code className="order-id">{orderId.slice(0, 10)}…</code> is confirmed.
                Thanks for shopping the drop.
              </Alert>
            ) : null}

            {errorMessage ? (
              <Alert variant="error" title="Something went wrong" onDismiss={dismissError}>
                {errorMessage}
              </Alert>
            ) : null}

            <div className="product-card__actions">
              {showCheckout && reservation ? (
                <Button
                  variant="primary"
                  size="lg"
                  loading={phase === "checking-out"}
                  onClick={() => void checkout()}
                >
                  Complete checkout
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  loading={isReserving}
                  disabled={!canReserve || soldOut}
                  onClick={() => void reserve()}
                >
                  {soldOut ? "Sold out" : isReserving ? "Reserving…" : "Reserve my pair"}
                </Button>
              )}

              {phase === "purchased" ? (
                <Button variant="secondary" onClick={() => void reload()}>
                  View drop again
                </Button>
              ) : null}
            </div>
          </div>
        </article>

        <DropStepGuide />
      </div>
    </AppShell>
  );
}
