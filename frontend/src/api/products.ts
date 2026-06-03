import { apiFetch } from "./client";
import type { CheckoutPaymentPayload } from "../types/payment";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  availableStock: number;
  totalStock: number;
}

export interface ActiveReservation {
  id: string;
  expiresAt: string;
  quantity: number;
  status: string;
}

export interface ProductDetailResponse {
  product: Product;
  activeReservation: ActiveReservation | null;
}

export interface ReserveResponse {
  reservationId: string;
  expiresAt: string;
  productId: string;
  quantity: number;
  remainingStock: number;
}

export interface CheckoutResponse {
  orderId: string;
  reservationId: string;
  totalCents: number;
  paymentMethod?: string;
  paymentLabel?: string;
}

export async function fetchDropProduct(productId: string): Promise<ProductDetailResponse> {
  return apiFetch<ProductDetailResponse>(`/products/${productId}`);
}

export async function fetchFirstProduct(): Promise<Product> {
  const list = await apiFetch<{
    items: Product[];
  }>("/products?limit=1&sortBy=createdAt&sortOrder=desc");
  const first = list.items[0];
  if (!first) {
    throw new Error("No drop product configured yet");
  }
  return first;
}

export async function reserveProduct(
  productId: string,
  quantity: number
): Promise<ReserveResponse> {
  return apiFetch<ReserveResponse>("/api/reserve", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function checkoutReservation(
  payment: CheckoutPaymentPayload
): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(payment),
  });
}
