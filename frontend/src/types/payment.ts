export type PaymentMethodType = "CARD" | "BANK" | "MOBILE";

export interface CardPaymentPayload {
  method: "CARD";
  reservationId: string;
  cardHolder: string;
  cardLast4: string;
  cardBrand?: "visa" | "mastercard" | "amex" | "other";
}

export interface BankPaymentPayload {
  method: "BANK";
  reservationId: string;
  accountHolder: string;
  bankName: string;
  accountLast4: string;
}

export interface MobilePaymentPayload {
  method: "MOBILE";
  reservationId: string;
  accountHolder: string;
  provider: string;
  phoneLast4: string;
}

export type CheckoutPaymentPayload =
  | CardPaymentPayload
  | BankPaymentPayload
  | MobilePaymentPayload;

export interface CardFormState {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface BankFormState {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface MobileFormState {
  accountHolder: string;
  provider: string;
  phone: string;
}
