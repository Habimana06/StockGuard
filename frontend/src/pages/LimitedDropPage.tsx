import { Button } from "../components/Button";
import { CountdownBanner } from "../components/CountdownBanner";
import { StockBadge } from "../components/StockBadge";
import { useProductDrop } from "../hooks/useProductDrop";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function LimitedDropPage() {
  const {
    product,
    reservation,
    phase,
    errorMessage,
    orderId,
    reserve,
    checkout,
    onExpired,
    reload,
  } = useProductDrop();

  if (phase === "loading" && !product) {
    return (
      <div className="page page--center">
        <p className="muted">Loading drop…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page page--center">
        <p className="error">{errorMessage ?? "Product unavailable"}</p>
        <Button variant="secondary" onClick={() => void reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const soldOut = product.availableStock <= 0 && !reservation;
  const canReserve =
    !soldOut && !reservation && phase !== "purchased" && phase !== "checking-out";
  const showCheckout =
    reservation != null && (phase === "reserved" || phase === "checking-out");

  return (
    <div className="page">
      <header className="hero">
        <p className="hero__eyebrow">StockGuard Limited Drop</p>
        <h1 className="hero__title">{product.name}</h1>
        {product.description ? (
          <p className="hero__desc">{product.description}</p>
        ) : null}
      </header>

      <section className="card">
        <div className="card__visual" aria-hidden>
          <div className="sneaker-glyph">SG</div>
        </div>

        <div className="card__body">
          <p className="price">{formatPrice(product.priceCents)}</p>
          <StockBadge available={product.availableStock} total={product.totalStock} />

          {reservation && phase !== "purchased" ? (
            <CountdownBanner
              expiresAt={reservation.expiresAt}
              onExpired={onExpired}
            />
          ) : null}

          {phase === "expired" ? (
            <p className="notice notice--warn">
              Your hold timed out. Stock may already be gone — reserve again if you still see units.
            </p>
          ) : null}

          {phase === "purchased" && orderId ? (
            <p className="notice notice--success">
              Order confirmed <code>{orderId.slice(0, 8)}…</code> — thanks!
            </p>
          ) : null}

          {errorMessage ? <p className="error">{errorMessage}</p> : null}

          <div className="actions">
            {showCheckout && reservation ? (
              <Button
                variant="primary"
                loading={phase === "checking-out"}
                onClick={() => void checkout()}
              >
                Complete checkout
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={phase === "loading"}
                disabled={!canReserve || soldOut}
                onClick={() => void reserve()}
              >
                {soldOut ? "Sold out" : "Reserve"}
              </Button>
            )}
          </div>

          <p className="hint">
            Stock refreshes every 5 seconds. Reservations lock inventory for 5 minutes.
          </p>
        </div>
      </section>
    </div>
  );
}
