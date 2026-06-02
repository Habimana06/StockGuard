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
  | "loading"
  | "reserved"
  | "checking-out"
  | "purchased"
  | "expired"
  | "sold-out"
  | "error";

export function useProductDrop() {
  const [product, setProduct] = useState<Product | null>(null);
  const [reservation, setReservation] = useState<ActiveReservation | null>(null);
  const [phase, setPhase] = useState<DropPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const loadProduct = useCallback(async (productId?: string) => {
    try {
      const id = productId ?? (await fetchFirstProduct()).id;
      const data = await fetchDropProduct(id);
      setProduct(data.product);
      setReservation(data.activeReservation);
      if (data.product.availableStock <= 0 && !data.activeReservation) {
        setPhase("sold-out");
      } else if (data.activeReservation) {
        setPhase("reserved");
      } else {
        setPhase("idle");
      }
      setErrorMessage(null);
    } catch (err) {
      setPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not load drop");
    }
  }, []);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  // Poll stock every 5s so the page reflects what others are taking
  useEffect(() => {
    if (!product) return;
    const id = window.setInterval(() => {
      void loadProduct(product.id);
    }, STOCK_POLL_MS);
    return () => window.clearInterval(id);
  }, [product?.id, loadProduct]);

  const reserve = useCallback(async () => {
    if (!product) return;
    setPhase("loading");
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
        if (err.status === 409) {
          setErrorMessage(err.message);
          if (err.message.includes("already have")) {
            await loadProduct(product.id);
            return;
          }
          setPhase(product.availableStock <= 0 ? "sold-out" : "idle");
          await loadProduct(product.id);
          return;
        }
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong — try again");
      }
      setPhase("error");
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
      setPhase("error");
    }
  }, [reservation]);

  const onExpired = useCallback(() => {
    setReservation(null);
    setPhase("expired");
    void loadProduct(product?.id);
  }, [loadProduct, product?.id]);

  return {
    product,
    reservation,
    phase,
    errorMessage,
    orderId,
    reserve,
    checkout,
    onExpired,
    reload: loadProduct,
  };
}
