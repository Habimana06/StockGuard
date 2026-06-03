import { useCallback, useMemo, useState } from "react";
import type {
  BankFormState,
  CardFormState,
  CheckoutPaymentPayload,
  MobileFormState,
  PaymentMethodType,
} from "../types/payment";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function last4(value: string): string {
  const d = digitsOnly(value);
  return d.slice(-4);
}

function luhnCheck(num: string): boolean {
  const d = digitsOnly(num);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectCardBrand(num: string): "visa" | "mastercard" | "amex" | "other" {
  const d = digitsOnly(num);
  if (d.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return "other";
}

const emptyCard: CardFormState = {
  cardHolder: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

const emptyBank: BankFormState = {
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  routingNumber: "",
};

const emptyMobile: MobileFormState = {
  accountHolder: "",
  provider: "",
  phone: "",
};

export function usePaymentForm(reservationId: string) {
  const [method, setMethod] = useState<PaymentMethodType>("BANK");
  const [card, setCard] = useState<CardFormState>(emptyCard);
  const [bank, setBank] = useState<BankFormState>(emptyBank);
  const [mobile, setMobile] = useState<MobileFormState>(emptyMobile);
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (method === "CARD") {
      if (card.cardHolder.trim().length < 2) e.cardHolder = "Enter name on card";
      if (!luhnCheck(card.cardNumber)) e.cardNumber = "Enter a valid card number";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry.trim())) e.expiry = "Use MM/YY";
      if (digitsOnly(card.cvv).length < 3) e.cvv = "Enter CVV";
    }
    if (method === "BANK") {
      if (bank.accountHolder.trim().length < 2) e.accountHolder = "Enter account holder name";
      if (bank.bankName.trim().length < 2) e.bankName = "Enter bank name";
      const acct = digitsOnly(bank.accountNumber);
      if (acct.length < 8) e.accountNumber = "Account number must be at least 8 digits";
      const routing = digitsOnly(bank.routingNumber);
      if (routing.length > 0 && routing.length < 9) {
        e.routingNumber = "Routing number should be 9 digits";
      }
    }
    if (method === "MOBILE") {
      if (mobile.accountHolder.trim().length < 2) e.accountHolder = "Enter account name";
      if (mobile.provider.trim().length < 2) e.provider = "Select or enter provider";
      const phone = digitsOnly(mobile.phone);
      if (phone.length < 8) e.phone = "Enter a valid phone number";
    }
    return e;
  }, [method, card, bank, mobile]);

  const isValid = Object.keys(errors).length === 0;

  const buildPayload = useCallback((): CheckoutPaymentPayload | null => {
    if (!isValid) return null;
    switch (method) {
      case "CARD":
        return {
          method: "CARD",
          reservationId,
          cardHolder: card.cardHolder.trim(),
          cardLast4: last4(card.cardNumber),
          cardBrand: detectCardBrand(card.cardNumber),
        };
      case "BANK":
        return {
          method: "BANK",
          reservationId,
          accountHolder: bank.accountHolder.trim(),
          bankName: bank.bankName.trim(),
          accountLast4: last4(bank.accountNumber),
        };
      case "MOBILE":
        return {
          method: "MOBILE",
          reservationId,
          accountHolder: mobile.accountHolder.trim(),
          provider: mobile.provider.trim(),
          phoneLast4: last4(mobile.phone),
        };
    }
  }, [method, card, bank, mobile, reservationId, isValid]);

  const markTouched = useCallback(() => setTouched(true), []);

  return {
    method,
    setMethod,
    card,
    setCard,
    bank,
    setBank,
    mobile,
    setMobile,
    errors,
    isValid,
    touched,
    markTouched,
    buildPayload,
  };
}
