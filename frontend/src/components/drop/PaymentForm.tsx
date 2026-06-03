import type { PaymentMethodType } from "../../types/payment";
import type { usePaymentForm } from "../../hooks/usePaymentForm";

type PaymentFormState = ReturnType<typeof usePaymentForm>;

interface PaymentFormProps {
  form: PaymentFormState;
}

const methods: { id: PaymentMethodType; label: string; desc: string }[] = [
  { id: "BANK", label: "Bank transfer", desc: "Pay from your bank account" },
  { id: "CARD", label: "Debit / credit card", desc: "Visa, Mastercard, Amex" },
  { id: "MOBILE", label: "Mobile money", desc: "M-Pesa, MTN, Airtel, etc." },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="field-error">{message}</span>;
}

function formatCardNumber(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 19);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function PaymentForm({ form }: PaymentFormProps) {
  const showErr = (key: string): string | undefined =>
    form.touched ? form.errors[key] : undefined;

  return (
    <div className="payment-form">
      <h3 className="payment-form__title">Choose payment method</h3>

      <div className="payment-methods" role="radiogroup" aria-label="Payment method">
        {methods.map((m) => (
          <label
            key={m.id}
            className={`payment-method ${form.method === m.id ? "payment-method--active" : ""}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={m.id}
              checked={form.method === m.id}
              onChange={() => form.setMethod(m.id)}
            />
            <span className="payment-method__radio" aria-hidden />
            <span className="payment-method__content">
              <span className="payment-method__label">{m.label}</span>
              <span className="payment-method__desc">{m.desc}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="payment-form__fields">
        {form.method === "BANK" ? (
          <>
            <label className="field">
              <span className="field__label">Account holder name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Full name on account"
                value={form.bank.accountHolder}
                onChange={(e) =>
                  form.setBank((b) => ({ ...b, accountHolder: e.target.value }))
                }
              />
              <FieldError message={showErr("accountHolder")} />
            </label>
            <label className="field">
              <span className="field__label">Bank name</span>
              <input
                type="text"
                placeholder="e.g. Chase, Equity, BNR"
                value={form.bank.bankName}
                onChange={(e) => form.setBank((b) => ({ ...b, bankName: e.target.value }))}
              />
              <FieldError message={showErr("bankName")} />
            </label>
            <label className="field">
              <span className="field__label">Account number</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Your bank account number"
                value={form.bank.accountNumber}
                onChange={(e) =>
                  form.setBank((b) => ({ ...b, accountNumber: e.target.value }))
                }
              />
              <FieldError message={showErr("accountNumber")} />
            </label>
            <label className="field">
              <span className="field__label">Routing / SWIFT (optional)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="9-digit routing or SWIFT"
                value={form.bank.routingNumber}
                onChange={(e) =>
                  form.setBank((b) => ({ ...b, routingNumber: e.target.value }))
                }
              />
              <FieldError message={showErr("routingNumber")} />
            </label>
          </>
        ) : null}

        {form.method === "CARD" ? (
          <>
            <label className="field">
              <span className="field__label">Name on card</span>
              <input
                type="text"
                autoComplete="cc-name"
                value={form.card.cardHolder}
                onChange={(e) =>
                  form.setCard((c) => ({ ...c, cardHolder: e.target.value }))
                }
              />
              <FieldError message={showErr("cardHolder")} />
            </label>
            <label className="field">
              <span className="field__label">Card number</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(form.card.cardNumber)}
                onChange={(e) =>
                  form.setCard((c) => ({
                    ...c,
                    cardNumber: e.target.value.replace(/\D/g, "").slice(0, 19),
                  }))
                }
              />
              <FieldError message={showErr("cardNumber")} />
            </label>
            <div className="field-row">
              <label className="field">
                <span className="field__label">Expiry</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={form.card.expiry}
                  onChange={(e) =>
                    form.setCard((c) => ({
                      ...c,
                      expiry: formatExpiry(e.target.value),
                    }))
                  }
                />
                <FieldError message={showErr("expiry")} />
              </label>
              <label className="field">
                <span className="field__label">CVV</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  value={form.card.cvv}
                  onChange={(e) =>
                    form.setCard((c) => ({
                      ...c,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                />
                <FieldError message={showErr("cvv")} />
              </label>
            </div>
          </>
        ) : null}

        {form.method === "MOBILE" ? (
          <>
            <label className="field">
              <span className="field__label">Account name</span>
              <input
                type="text"
                value={form.mobile.accountHolder}
                onChange={(e) =>
                  form.setMobile((m) => ({ ...m, accountHolder: e.target.value }))
                }
              />
              <FieldError message={showErr("accountHolder")} />
            </label>
            <label className="field">
              <span className="field__label">Provider</span>
              <input
                type="text"
                list="mobile-providers"
                placeholder="M-Pesa, MTN MoMo, Airtel Money…"
                value={form.mobile.provider}
                onChange={(e) =>
                  form.setMobile((m) => ({ ...m, provider: e.target.value }))
                }
              />
              <datalist id="mobile-providers">
                <option value="M-Pesa" />
                <option value="MTN MoMo" />
                <option value="Airtel Money" />
                <option value="Orange Money" />
              </datalist>
              <FieldError message={showErr("provider")} />
            </label>
            <label className="field">
              <span className="field__label">Phone number</span>
              <input
                type="tel"
                inputMode="tel"
                placeholder="+250 7XX XXX XXX"
                value={form.mobile.phone}
                onChange={(e) =>
                  form.setMobile((m) => ({ ...m, phone: e.target.value }))
                }
              />
              <FieldError message={showErr("phone")} />
            </label>
          </>
        ) : null}
      </div>

      <p className="payment-form__secure-note">
        We only store the last 4 digits of your payment reference — never your full account
        or card number.
      </p>
    </div>
  );
}
