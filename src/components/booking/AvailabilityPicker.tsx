"use client";

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type ActivePanel = "dates" | "guests" | null;
type DateStage = "checkIn" | "checkOut";

export interface AvailabilityPickerProps {
  checkIn: string;
  checkOut: string;
  guests: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: string) => void;
}

const GUEST_OPTIONS = [
  { value: "1", labelKey: "availability.guestOne" },
  { value: "2", labelKey: "availability.guestTwo" },
  { value: "3", labelKey: "availability.guestThree" },
  { value: "4", labelKey: "availability.guestFour" },
];

function toLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function isBeforeDay(left: Date, right: Date) {
  return startOfDay(left).getTime() < startOfDay(right).getTime();
}

function isAfterDay(left: Date, right: Date) {
  return startOfDay(left).getTime() > startOfDay(right).getTime();
}

function buildCalendarDays(month: Date) {
  const monthStart = startOfMonth(month);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(monthStart.getFullYear(), monthStart.getMonth(), index - mondayOffset + 1);
    return { date: day, inCurrentMonth: day.getMonth() === monthStart.getMonth() };
  });
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatDate(value: string, locale: string, emptyLabel: string) {
  const date = toLocalDate(value);
  if (!date) return emptyLabel;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMonth(value: Date, locale: string) {
  const label = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="availability-picker-icon">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.45" />
      <path d="M8 3.5v3M16 3.5v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction = "down" }: { direction?: "down" | "left" | "right" }) {
  const rotation = direction === "left" ? "rotate(90 12 12)" : direction === "right" ? "rotate(-90 12 12)" : undefined;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="availability-picker-icon">
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" transform={rotation} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="availability-picker-icon">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="availability-picker-check">
      <path d="m5.5 12.5 4 4 9-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AvailabilityPicker({
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
}: AvailabilityPickerProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "en" ? "en-GB" : "vi-VN";
  const pickerId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const originRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [dateStage, setDateStage] = useState<DateStage>("checkIn");
  const [draftCheckIn, setDraftCheckIn] = useState(checkIn);
  const [draftCheckOut, setDraftCheckOut] = useState(checkOut);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(toLocalDate(checkIn) || new Date()));
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const today = useMemo(() => startOfDay(new Date()), []);

  const guestOptions = GUEST_OPTIONS.map((option) => ({ ...option, label: t(option.labelKey) }));
  const selectedGuest = guestOptions.find((option) => option.value === guests) || guestOptions[1];
  const weekdays = lang === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const displayDate = (value: string) => formatDate(value, locale, t("availability.chooseDate"));
  const displayMonth = (value: Date) => formatMonth(value, locale);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const draftStart = toLocalDate(draftCheckIn);
  const draftEnd = toLocalDate(draftCheckOut);
  const datePanelId = `${pickerId}-date-panel`;
  const guestPanelId = `${pickerId}-guest-panel`;

  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(max-width: 680px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const closePanel = useCallback((restoreFocus = true) => {
    setActivePanel(null);
    if (restoreFocus) {
      window.setTimeout(() => originRef.current?.focus(), 0);
    }
  }, []);

  const updatePanelPosition = useCallback(() => {
    if (!activePanel || isMobile || !originRef.current) return;
    const trigger = originRef.current.getBoundingClientRect();
    const width = activePanel === "dates" ? 604 : 292;
    const height = activePanel === "dates" ? 454 : 330;
    const margin = 16;
    const belowSpace = window.innerHeight - trigger.bottom;
    const aboveSpace = trigger.top;
    const opensAbove = aboveSpace >= height + margin || aboveSpace > belowSpace;
    const left = activePanel === "dates"
      ? clamp(trigger.left - 132, margin, window.innerWidth - width - margin)
      : clamp(trigger.right - width, margin, window.innerWidth - width - margin);
    const top = opensAbove
      ? Math.max(margin, trigger.top - height - 12)
      : Math.min(window.innerHeight - height - margin, trigger.bottom + 12);

    setPanelStyle({ left, top, width });
  }, [activePanel, isMobile]);

  useEffect(() => {
    if (!activePanel || isMobile) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [activePanel, isMobile, updatePanelPosition]);

  useEffect(() => {
    if (!activePanel) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closePanel(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activePanel, closePanel]);

  useEffect(() => {
    if (!activePanel || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activePanel, isMobile]);

  useEffect(() => {
    if (!activePanel || !mounted) return;
    const timer = window.setTimeout(() => {
      const initialControl = panelRef.current?.querySelector<HTMLButtonElement>(".availability-picker-dismiss");
      initialControl?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activePanel, mounted]);

  const openDatePanel = (stage: DateStage, event: ReactMouseEvent<HTMLButtonElement>) => {
    originRef.current = event.currentTarget;
    setDraftCheckIn(checkIn);
    setDraftCheckOut(checkOut);
    setDateStage(stage);
    const focusDate = toLocalDate(stage === "checkIn" ? checkIn : checkOut) || toLocalDate(checkIn) || today;
    setVisibleMonth(startOfMonth(focusDate));
    setActivePanel("dates");
  };

  const openGuestPanel = (event: ReactMouseEvent<HTMLButtonElement>) => {
    originRef.current = event.currentTarget;
    setActivePanel("guests");
  };

  const chooseDate = (date: Date) => {
    const isoDate = toIsoDate(date);
    if (isBeforeDay(date, today)) return;

    if (dateStage === "checkIn" || !draftStart) {
      setDraftCheckIn(isoDate);
      setDraftCheckOut("");
      setDateStage("checkOut");
      return;
    }

    if (!isAfterDay(date, draftStart)) return;
    onCheckInChange(draftCheckIn);
    onCheckOutChange(isoDate);
    closePanel();
  };

  const chooseGuest = (value: string) => {
    onGuestsChange(value);
    closePanel();
  };

  const renderDatePanel = () => (
    <>
      <div className="availability-picker-panel-header">
        <div>
          <span className="availability-picker-kicker">{t("availability.stayDates")}</span>
          <h3>{t("availability.chooseStayDates")}</h3>
        </div>
        <button type="button" className="availability-picker-dismiss" onClick={() => closePanel()} aria-label={t("availability.closeDatePicker")}>
          <CloseIcon />
        </button>
      </div>

      <div className="availability-picker-range-summary" aria-live="polite">
        <span className={dateStage === "checkIn" ? "is-current" : ""}>
          <small>{t("availability.checkIn")}</small>
          <strong>{displayDate(draftCheckIn)}</strong>
        </span>
        <i aria-hidden="true" />
        <span className={dateStage === "checkOut" ? "is-current" : ""}>
          <small>{t("availability.checkOut")}</small>
          <strong>{draftCheckOut ? displayDate(draftCheckOut) : t("availability.chooseDate")}</strong>
        </span>
      </div>

      <div className="availability-picker-calendar-head">
        <button
          type="button"
          className="availability-picker-month-button"
          onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
          aria-label={t("availability.previousMonth")}
        >
          <ChevronIcon direction="left" />
        </button>
        <strong>{displayMonth(visibleMonth)}</strong>
        <button
          type="button"
          className="availability-picker-month-button"
          onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          aria-label={t("availability.nextMonth")}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="availability-picker-weekdays" aria-hidden="true">
        {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className="availability-picker-days" role="grid" aria-label={t("availability.calendar", { month: displayMonth(visibleMonth) })}>
        {calendarDays.map(({ date, inCurrentMonth }) => {
          const beforeToday = isBeforeDay(date, today);
          const beforeStart = dateStage === "checkOut" && draftStart ? !isAfterDay(date, draftStart) : false;
          const disabled = beforeToday || beforeStart;
          const isStart = draftStart ? isSameDay(date, draftStart) : false;
          const isEnd = draftEnd ? isSameDay(date, draftEnd) : false;
          const isInRange = draftStart && draftEnd && isAfterDay(date, draftStart) && isBeforeDay(date, draftEnd);

          return (
            <button
              key={toIsoDate(date)}
              type="button"
              role="gridcell"
              className={`availability-picker-day${inCurrentMonth ? "" : " is-outside"}${isStart ? " is-start" : ""}${isEnd ? " is-end" : ""}${isInRange ? " is-in-range" : ""}`}
              onClick={() => chooseDate(date)}
              disabled={disabled}
              aria-label={`${date.getDate()} ${displayMonth(date)}${disabled ? `, ${t("availability.unavailable")}` : ""}`}
              aria-current={isSameDay(date, today) ? "date" : undefined}
              aria-selected={isStart || isEnd ? true : undefined}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="availability-picker-hint">
        {dateStage === "checkIn" ? t("availability.chooseCheckIn") : t("availability.chooseCheckOut")}
      </p>
    </>
  );

  const renderGuestPanel = () => (
    <>
      <div className="availability-picker-panel-header">
        <div>
          <span className="availability-picker-kicker">{t("availability.guests")}</span>
          <h3>{t("availability.chooseGuests")}</h3>
        </div>
        <button type="button" className="availability-picker-dismiss" onClick={() => closePanel()} aria-label={t("availability.closeGuestPicker")}>
          <CloseIcon />
        </button>
      </div>
      <div className="availability-picker-guest-list" role="listbox" aria-label={t("availability.chooseGuests")}>
        {guestOptions.map((option) => {
          const selected = option.value === guests;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selected}
              className={`availability-picker-guest-option${selected ? " is-selected" : ""}`}
              onClick={() => chooseGuest(option.value)}
            >
              <span>{option.label}</span>
              {selected && <CheckIcon />}
            </button>
          );
        })}
      </div>
      <p className="availability-picker-hint">{t("availability.guestAdjustment")}</p>
    </>
  );

  const panel = activePanel ? (
    <div className={`availability-picker-layer${isMobile ? " is-mobile" : ""}`}>
      {isMobile && <button type="button" className="availability-picker-backdrop" onClick={() => closePanel()} aria-label={t("availability.closePicker")} />}
      <section
        ref={panelRef}
        id={activePanel === "dates" ? datePanelId : guestPanelId}
        className={`availability-picker-panel availability-picker-panel--${activePanel}`}
        style={isMobile ? undefined : panelStyle}
        role="dialog"
        aria-label={activePanel === "dates" ? t("availability.chooseStayDates") : t("availability.chooseGuests")}
        aria-modal={isMobile ? true : undefined}
        tabIndex={-1}
      >
        {activePanel === "dates" ? renderDatePanel() : renderGuestPanel()}
      </section>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="availability-picker" data-testid="availability-picker">
      <div className="field availability-field">
        <button
          type="button"
          className="availability-picker-trigger"
          onClick={(event) => openDatePanel("checkIn", event)}
          aria-label={t("availability.currentCheckIn", { date: displayDate(checkIn) })}
          aria-haspopup="dialog"
          aria-controls={datePanelId}
          aria-expanded={activePanel === "dates" && dateStage === "checkIn"}
        >
          <span>
            <small>{t("availability.checkIn")}</small>
            <strong>{displayDate(checkIn)}</strong>
          </span>
          <CalendarIcon />
        </button>
      </div>

      <div className="field availability-field">
        <button
          type="button"
          className="availability-picker-trigger"
          onClick={(event) => openDatePanel("checkOut", event)}
          aria-label={t("availability.currentCheckOut", { date: displayDate(checkOut) })}
          aria-haspopup="dialog"
          aria-controls={datePanelId}
          aria-expanded={activePanel === "dates" && dateStage === "checkOut"}
        >
          <span>
            <small>{t("availability.checkOut")}</small>
            <strong>{displayDate(checkOut)}</strong>
          </span>
          <CalendarIcon />
        </button>
      </div>

      <div className="field availability-field">
        <button
          type="button"
          className="availability-picker-trigger"
          onClick={openGuestPanel}
          aria-label={t("availability.currentGuests", { guests: selectedGuest.label })}
          aria-haspopup="listbox"
          aria-controls={guestPanelId}
          aria-expanded={activePanel === "guests"}
        >
          <span>
            <small>{t("availability.guests")}</small>
            <strong>{selectedGuest.label}</strong>
          </span>
          <ChevronIcon />
        </button>
      </div>

      {mounted && typeof document !== "undefined" ? createPortal(panel, document.body) : null}

      <style>{`
        .availability-picker { display: contents; }
        .availability-picker-trigger {
          width: 100%;
          min-height: 46px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--espresso);
          text-align: left;
          cursor: pointer;
          transition: color 220ms cubic-bezier(.22,.8,.22,1);
        }
        .availability-picker-trigger > span { min-width: 0; }
        .availability-picker-trigger small {
          display: block;
          color: #665044;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-weight: 700;
        }
        .availability-picker-trigger strong {
          display: block;
          margin-top: 4px;
          color: var(--espresso);
          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .availability-picker-icon { width: 17px; height: 17px; flex: 0 0 auto; color: var(--espresso); }
        .availability-picker-trigger:hover { color: var(--walnut); }
        .availability-picker-trigger:hover .availability-picker-icon { color: var(--antique-brass); }
        .availability-picker-trigger:focus-visible,
        .availability-picker-panel button:focus-visible {
          outline: 2px solid var(--antique-brass);
          outline-offset: 3px;
        }

        .availability-picker-layer {
          position: fixed;
          inset: 0;
          z-index: 80;
          pointer-events: none;
        }
        .availability-picker-panel {
          position: fixed;
          pointer-events: auto;
          overflow: hidden;
          box-sizing: border-box;
          border: 1px solid rgba(102,80,68,.25);
          border-radius: 18px;
          background: var(--warm-ivory);
          color: var(--espresso);
          box-shadow: 0 24px 60px rgba(38,30,26,.20), 0 2px 8px rgba(38,30,26,.08);
          padding: 20px;
          animation: availability-picker-popover-in 260ms cubic-bezier(.22,.8,.22,1) both;
        }
        .availability-picker-panel:focus-visible { outline: none; }
        .availability-picker-panel--guests { min-height: 298px; }
        .availability-picker-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .availability-picker-kicker {
          display: block;
          margin-bottom: 4px;
          color: var(--terracotta);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
        }
        .availability-picker-panel h3 {
          margin: 0;
          color: var(--espresso);
          font: 600 28px/.95 "Cormorant Garamond", serif;
          letter-spacing: -.02em;
        }
        .availability-picker-dismiss,
        .availability-picker-month-button {
          display: inline-grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: var(--espresso);
          cursor: pointer;
        }
        .availability-picker-dismiss {
          width: 38px;
          height: 38px;
          margin: -4px -4px 0 0;
          border: 1px solid rgba(102,80,68,.24);
          border-radius: 50%;
          transition: border-color 200ms cubic-bezier(.22,.8,.22,1), background 200ms cubic-bezier(.22,.8,.22,1), transform 200ms cubic-bezier(.22,.8,.22,1);
        }
        .availability-picker-dismiss:hover { border-color: var(--antique-brass); background: rgba(181,154,107,.10); transform: rotate(6deg); }
        .availability-picker-range-summary {
          display: grid;
          grid-template-columns: 1fr 26px 1fr;
          align-items: center;
          gap: 8px;
          margin: 20px 0 18px;
          padding: 12px 14px;
          border-radius: 13px;
          background: #f3eee7;
        }
        .availability-picker-range-summary span { min-width: 0; }
        .availability-picker-range-summary small {
          display: block;
          color: var(--taupe);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .availability-picker-range-summary strong {
          display: block;
          margin-top: 4px;
          color: #665044;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .availability-picker-range-summary .is-current strong { color: var(--espresso); }
        .availability-picker-range-summary .is-current small { color: var(--terracotta); }
        .availability-picker-range-summary i {
          position: relative;
          display: block;
          height: 1px;
          background: rgba(102,80,68,.28);
        }
        .availability-picker-range-summary i::after {
          content: "";
          position: absolute;
          right: 0;
          top: -2px;
          width: 5px;
          height: 5px;
          border-top: 1px solid #665044;
          border-right: 1px solid #665044;
          transform: rotate(45deg);
        }
        .availability-picker-calendar-head {
          display: grid;
          grid-template-columns: 40px 1fr 40px;
          align-items: center;
          margin-bottom: 10px;
          text-align: center;
        }
        .availability-picker-calendar-head strong { color: var(--espresso); font-size: 13px; font-weight: 700; }
        .availability-picker-month-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          transition: background 180ms cubic-bezier(.22,.8,.22,1), transform 180ms cubic-bezier(.22,.8,.22,1);
        }
        .availability-picker-month-button:hover { background: rgba(181,154,107,.13); transform: scale(1.04); }
        .availability-picker-weekdays,
        .availability-picker-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
        .availability-picker-weekdays { margin-bottom: 4px; }
        .availability-picker-weekdays span { color: var(--taupe); font-size: 9px; font-weight: 700; line-height: 26px; text-align: center; }
        .availability-picker-day {
          position: relative;
          min-height: 38px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: var(--espresso);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 180ms cubic-bezier(.22,.8,.22,1), background 180ms cubic-bezier(.22,.8,.22,1), color 180ms cubic-bezier(.22,.8,.22,1);
        }
        .availability-picker-day:hover:not(:disabled) { background: rgba(181,154,107,.16); transform: translateY(-1px); }
        .availability-picker-day.is-outside { color: rgba(136,122,112,.52); }
        .availability-picker-day:disabled { color: rgba(136,122,112,.42); cursor: not-allowed; }
        .availability-picker-day.is-in-range { border-radius: 0; background: rgba(181,154,107,.16); }
        .availability-picker-day.is-start,
        .availability-picker-day.is-end { z-index: 1; border-radius: 10px; background: var(--antique-brass); color: var(--espresso); }
        .availability-picker-day.is-start.is-end { border-radius: 10px; }
        .availability-picker-hint { margin: 14px 0 0; color: var(--taupe); font-size: 10px; line-height: 1.5; }
        .availability-picker-guest-list { display: grid; gap: 7px; margin-top: 20px; }
        .availability-picker-guest-option {
          width: 100%;
          min-height: 46px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 12px 11px 14px;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: var(--espresso);
          font-size: 13px;
          font-weight: 650;
          text-align: left;
          cursor: pointer;
          transition: border-color 190ms cubic-bezier(.22,.8,.22,1), background 190ms cubic-bezier(.22,.8,.22,1), transform 190ms cubic-bezier(.22,.8,.22,1);
        }
        .availability-picker-guest-option:hover { border-color: rgba(181,154,107,.45); background: rgba(181,154,107,.10); transform: translateX(2px); }
        .availability-picker-guest-option.is-selected { border-color: rgba(181,154,107,.62); background: rgba(181,154,107,.16); }
        .availability-picker-check { width: 18px; height: 18px; color: var(--terracotta); }
        @keyframes availability-picker-popover-in {
          from { opacity: 0; transform: translateY(10px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes availability-picker-sheet-in {
          from { opacity: 0; transform: translateY(36px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 680px) {
          .availability-picker-layer { pointer-events: auto; display: flex; align-items: flex-end; }
          .availability-picker-backdrop {
            position: absolute;
            inset: 0;
            border: 0;
            background: rgba(38,30,26,.36);
            cursor: pointer;
            animation: availability-picker-fade-in 220ms cubic-bezier(.22,.8,.22,1) both;
          }
          .availability-picker-panel {
            position: relative;
            z-index: 1;
            width: 100% !important;
            max-height: min(690px, calc(100dvh - env(safe-area-inset-top)));
            overflow-y: auto;
            border-right: 0;
            border-bottom: 0;
            border-left: 0;
            border-radius: 24px 24px 0 0;
            padding: 22px 20px max(24px, env(safe-area-inset-bottom));
            box-shadow: 0 -18px 48px rgba(38,30,26,.20);
            animation: availability-picker-sheet-in 300ms cubic-bezier(.22,.8,.22,1) both;
          }
          .availability-picker-panel::before {
            content: "";
            display: block;
            width: 36px;
            height: 4px;
            margin: -10px auto 18px;
            border-radius: 999px;
            background: rgba(102,80,68,.34);
          }
          .availability-picker-panel h3 { font-size: 32px; }
          .availability-picker-panel--dates { min-height: 510px; }
          .availability-picker-day { min-height: 43px; font-size: 13px; }
          .availability-picker-weekdays span { line-height: 30px; }
          .availability-picker-guest-option { min-height: 52px; font-size: 14px; }
        }
        @keyframes availability-picker-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .availability-picker-panel,
          .availability-picker-backdrop { animation: none !important; }
          .availability-picker-trigger,
          .availability-picker-dismiss,
          .availability-picker-month-button,
          .availability-picker-day,
          .availability-picker-guest-option { transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
