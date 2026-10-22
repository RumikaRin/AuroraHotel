"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type SelectValue = string | number;

export interface AuroraSelectOption<T extends SelectValue> {
  value: T;
  label: string;
  description?: string;
}

interface AuroraSelectProps<T extends SelectValue> {
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: T) => void;
  options: readonly AuroraSelectOption<T>[];
  placeholder?: string;
  value: T;
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="aurora-select-chevron">
      <path d="m7 9.5 5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="aurora-select-chevron">
      <path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.45" />
    </svg>
  );
}

export function AuroraSelect<T extends SelectValue>({
  ariaLabel,
  className = "",
  disabled = false,
  label,
  onValueChange,
  options,
  placeholder,
  value,
}: AuroraSelectProps<T>) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);
  const selectionLabel = selectedOption?.label ?? placeholder ?? t("controls.chooseOption");
  const controlLabel = ariaLabel ?? `${label}: ${selectionLabel}`;

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const chooseOption = (nextValue: T) => {
    onValueChange(nextValue);
    close();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <div className={`aurora-select ${className}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="aurora-select-trigger"
        onClick={() => setIsOpen((open) => !open)}
        disabled={disabled}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={controlLabel}
      >
        <span className="aurora-select-value">{selectionLabel}</span>
        <ChevronIcon />
      </button>

      {isOpen && (
        <>
          <button type="button" className="aurora-select-scrim" aria-hidden="true" tabIndex={-1} onClick={close} />
          <div className="aurora-select-panel">
            <div className="aurora-select-mobile-heading">
              <span>{label}</span>
              <button type="button" onClick={close} aria-label={t("controls.close", { label })}>
                <CloseIcon />
              </button>
            </div>
            <div id={listboxId} className="aurora-select-list" role="listbox" aria-label={label}>
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`aurora-select-option${selected ? " is-selected" : ""}`}
                    onClick={() => chooseOption(option.value)}
                  >
                    <span>
                      <strong>{option.label}</strong>
                      {option.description ? <small>{option.description}</small> : null}
                    </span>
                    <i aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
