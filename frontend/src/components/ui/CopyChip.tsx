import { useCallback, useState } from "react";

interface CopyChipProps {
  label: string;
  value: string;
}

export function CopyChip({ label, value }: CopyChipProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  }, [value]);

  return (
    <button type="button" className="copy-chip" onClick={() => void copy()}>
      <span className="copy-chip__label">{label}</span>
      <span className="copy-chip__value">{value.slice(0, 12)}…</span>
      <span className="copy-chip__action">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
