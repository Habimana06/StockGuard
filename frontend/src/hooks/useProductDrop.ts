import { useCallback, useEffect, useState } from "react";
import {
  checkoutReservation,
  fetchDropProduct,
  fetchFirstProduct,
  reserveProduct,
  type ActiveReservation,
  type Product,
} from "../api/products";
import { ApiError } from "../api/client";

const STOCK_POLL_MS = 5000;

export type DropPhase =
  | "idle"
  | "reserved"
  | "checking-out"
  | "purchased"
  | "expired"
  | "sold-out"
  | "error";

export function useProductDrop() {
  const [product, setProduct] = useState<Product | null>(null);
  const [reservation, setReservation] = useState<ActiveReservation | null>(null);
  const [phase, setPhase] = useState<DropPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const loadProduct = useCallback(
    async (productId?: string, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        if (!product) setIsInitialLoading(true);
        else setIsRefreshing(true);
      }

      try {
        const id = productId ?? product?.id ?? (await fetchFirstProduct()).id;
        const data = await fetchDropProduct(id);
        setProduct(data.product);
        setReservation(data.activeReservation);
        setLastRefreshedAt(new Date());

        setPhase((current) => {
          if (current === "purchased" || current === "expired" || current === "checking-out") {
            return current;
          }
          if (data.product.availableStock <= 0 && !data.activeReservation) {
            return "sold-out";
          }
          if (data.activeReservation) {
            return "reserved";
          }
          return "idle";
        });

        if (!silent) setErrorMessage(null);
      } catch (err) {
        if (!silent) {
          setPhase("error");
          setErrorMessage(
            err instanceof Error ? err.message : "Could not load drop"
          );
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [product]
  );

  useEffect(() => {
    void loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    if (!product?.id) return;
    const id = window.setInterval(() => {
      void loadProduct(product.id, { silent: true });
    }, STOCK_POLL_MS);
    return () => window.clearInterval(id);
  }, [product?.id, loadProduct]);

  const reserve = useCallback(async () => {
    if (!product) return;
    setIsReserving(true);
    setErrorMessage(null);
    try {
      const result = await reserveProduct(product.id, 1);
      setProduct((p) =>
        p ? { ...p, availableStock: result.remainingStock } : p
      );
      setReservation({
        id: result.reservationId,
        expiresAt: result.expiresAt,
        quantity: result.quantity,
        status: "ACTIVE",
      });
      setPhase("reserved");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        if (err.message.includes("already have")) {
          await loadProduct(product.id, { silent: true });
          return;
        }
        setPhase(product.availableStock <= 0 ? "sold-out" : "idle");
        await loadProduct(product.id, { silent: true });
        return;
      }
      setErrorMessage("Something went wrong — check your connection and try again");
      setPhase("idle");
    } finally {
      setIsReserving(false);
    }
  }, [product, loadProduct]);

  const checkout = useCallback(async () => {
    if (!reservation) return;
    setPhase("checking-out");
    setErrorMessage(null);
    try {
      const result = await checkoutReservation(reservation.id);
      setOrderId(result.orderId);
      setPhase("purchased");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Checkout failed");
      setPhase("reserved");
    }
  }, [reservation]);

  const onExpired = useCallback(() => {
    setReservation(null);
    setPhase("expired");
    void loadProduct(product?.id, { silent: true });
  }, [loadProduct, product?.id]);

  const dismissError = useCallback(() => setErrorMessage(null), []);

  return {
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
    reload: () => loadProduct(),
  };
}
