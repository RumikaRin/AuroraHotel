"use client";

import { CSSProperties, useEffect, useId, useRef, useState } from "react";
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

  const panelStyle = { "--aurora-select-count": options.length } as CSSProperties;

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
          <div className="aurora-select-panel" style={panelStyle}>
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

      <style>{`
        .aurora-select { position: relative; min-width: 0; }
        .aurora-select-trigger { width: 100%; min-height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 13px; border: 1px solid #d9cfc3; border-radius: 7px; background: var(--warm-ivory); color: var(--espresso); text-align: left; font: 600 12px/1.2 var(--font-interface); cursor: pointer; transition: border-color 190ms cubic-bezier(.22,.8,.22,1), background 190ms cubic-bezier(.22,.8,.22,1), box-shadow 190ms cubic-bezier(.22,.8,.22,1); }
        .aurora-select-trigger:hover { border-color: rgba(181,154,107,.82); background: #fffdf8; }
        .aurora-select-trigger:focus-visible { outline: none; border-color: var(--antique-brass); box-shadow: 0 0 0 3px rgba(181,154,107,.18); }
        .aurora-select-trigger:disabled { cursor: wait; opacity: .58; }
        .aurora-select-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .aurora-select-chevron { width: 18px; height: 18px; flex: 0 0 auto; color: var(--walnut); transition: transform 220ms cubic-bezier(.22,.8,.22,1); }
        .aurora-select-trigger[aria-expanded="true"] .aurora-select-chevron { transform: rotate(180deg); }
        .aurora-select-scrim { display: none; }
        .aurora-select-panel { position: absolute; z-index: 30; top: calc(100% + 8px); right: 0; left: 0; min-width: max(100%, 220px); overflow: hidden; border: 1px solid rgba(181,154,107,.42); border-radius: 12px; background: var(--warm-ivory); box-shadow: 0 18px 44px rgba(38,30,26,.16); animation: aurora-select-popover-in 220ms cubic-bezier(.22,.8,.22,1) both; }
        .aurora-select-mobile-heading { display: none; }
        .aurora-select-list { display: grid; gap: 2px; padding: 6px; }
        .aurora-select-option { min-height: 43px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 9px 10px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--espresso); text-align: left; cursor: pointer; transition: background 170ms cubic-bezier(.22,.8,.22,1), border-color 170ms cubic-bezier(.22,.8,.22,1), transform 170ms cubic-bezier(.22,.8,.22,1); }
        .aurora-select-option:hover, .aurora-select-option:focus-visible { border-color: rgba(181,154,107,.5); background: rgba(181,154,107,.1); outline: none; transform: translateX(2px); }
        .aurora-select-option strong { display: block; font: 600 12px/1.3 var(--font-interface); }
        .aurora-select-option small { display: block; margin-top: 3px; color: var(--taupe); font: 10px/1.35 var(--font-interface); }
        .aurora-select-option i { width: 8px; height: 8px; flex: 0 0 auto; border: 1px solid rgba(102,80,68,.42); border-radius: 50%; }
        .aurora-select-option.is-selected { border-color: rgba(181,154,107,.68); background: rgba(181,154,107,.15); }
        .aurora-select-option.is-selected i { border-color: var(--antique-brass); background: var(--antique-brass); box-shadow: inset 0 0 0 2px var(--warm-ivory); }
        @keyframes aurora-select-popover-in { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (max-width: 680px) {
          .aurora-select-scrim { position: fixed; z-index: 59; inset: 0; display: block; border: 0; background: rgba(25,21,18,.52); animation: aurora-select-scrim-in 190ms cubic-bezier(.22,.8,.22,1) both; }
          .aurora-select-panel { position: fixed; z-index: 60; top: auto; right: 0; bottom: 0; left: 0; min-width: 0; max-height: min(72dvh, calc(100dvh - 90px)); padding: 8px 14px max(18px, env(safe-area-inset-bottom)); border: 1px solid rgba(181,154,107,.45); border-bottom: 0; border-radius: 22px 22px 0 0; box-shadow: 0 -24px 80px rgba(25,21,18,.25); animation: aurora-select-sheet-in 280ms cubic-bezier(.22,.8,.22,1) both; }
          .aurora-select-mobile-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 4px 12px; color: var(--espresso); font: 600 21px/1 var(--font-display); }
          .aurora-select-mobile-heading > span::before { content: ""; display: block; width: 36px; height: 3px; margin: -3px auto 14px; border-radius: 99px; background: rgba(102,80,68,.28); }
          .aurora-select-mobile-heading button { width: 40px; height: 40px; display: inline-grid; place-items: center; border: 1px solid rgba(102,80,68,.22); border-radius: 50%; background: transparent; color: var(--espresso); }
          .aurora-select-list { max-height: min(53dvh, calc(100dvh - 180px)); overflow: auto; padding: 3px 0 0; }
          .aurora-select-option { min-height: 54px; padding: 12px 11px; }
          .aurora-select-option strong { font-size: 14px; }
          @keyframes aurora-select-sheet-in { from { opacity: 0; transform: translateY(42px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes aurora-select-scrim-in { from { opacity: 0; } to { opacity: 1; } }
        }
        @media (prefers-reduced-motion: reduce) { .aurora-select *, .aurora-select-panel { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
      `}</style>
    </div>
  );
}
