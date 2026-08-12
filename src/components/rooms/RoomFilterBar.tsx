"use client";

import { useState } from "react";
import { AuroraSelect } from "@/components/controls/AuroraSelect";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export interface FilterCriteria {
  searchQuery: string;
  maxPrice: number;
  viewType: string;
  minCapacity: number;
}

interface RoomFilterBarProps {
  onFilterChange: (filters: FilterCriteria) => void;
  onOpenCompare: () => void;
  selectedCompareCount: number;
}

export function RoomFilterBar({ onFilterChange, onOpenCompare, selectedCompareCount }: RoomFilterBarProps) {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(25000000);
  const [viewType, setViewType] = useState("ALL");
  const [minCapacity, setMinCapacity] = useState(1);

  const update = (next: Partial<FilterCriteria>) => {
    const nextFilters = { searchQuery, maxPrice, viewType, minCapacity, ...next };
    setSearchQuery(nextFilters.searchQuery);
    setMaxPrice(nextFilters.maxPrice);
    setViewType(nextFilters.viewType);
    setMinCapacity(nextFilters.minCapacity);
    onFilterChange(nextFilters);
  };

  const handleReset = () => update({ searchQuery: "", maxPrice: 25000000, viewType: "ALL", minCapacity: 1 });

  return (
    <div className="room-filter-bar">
      <div className="room-filter-heading">
        <div>
          <p className="room-filter-eyebrow">{t("rooms.filter.refine")}</p>
          <h2>{t("rooms.filter.title")}</h2>
        </div>
        <div className="room-filter-actions">
          <button type="button" onClick={onOpenCompare} disabled={selectedCompareCount === 0} className="room-compare-button">
            {t("rooms.filter.compare", { count: selectedCompareCount > 0 ? `(${selectedCompareCount})` : "" })}
          </button>
          <button type="button" onClick={handleReset} className="room-reset-button">{t("rooms.filter.reset")}</button>
        </div>
      </div>

      <div className="room-filter-grid">
        <label className="room-filter-field">
          <span>{t("rooms.filter.name")}</span>
          <input
            type="search"
            placeholder={t("rooms.filter.namePlaceholder")}
            value={searchQuery}
            onChange={(event) => update({ searchQuery: event.target.value })}
          />
        </label>
        <div className="room-filter-field">
          <span>{t("rooms.filter.view")}</span>
          <AuroraSelect
            label={t("rooms.filter.view")}
            value={viewType}
            onValueChange={(nextView) => update({ viewType: nextView })}
            options={[
              { value: "ALL", label: t("rooms.filter.allViews") },
              { value: "OCEAN", label: t("rooms.filter.ocean") },
              { value: "GARDEN", label: t("rooms.filter.garden") },
              { value: "POOL", label: t("rooms.filter.pool") },
            ]}
          />
        </div>
        <div className="room-filter-field">
          <span>{t("rooms.filter.capacity")} <b>{t("rooms.filter.guestsMin", { count: minCapacity })}</b></span>
          <AuroraSelect
            label={t("rooms.filter.capacity")}
            value={minCapacity}
            onValueChange={(nextCapacity) => update({ minCapacity: nextCapacity })}
            options={[
              { value: 1, label: t("rooms.filter.guestsMin", { count: 1 }) },
              { value: 2, label: t("rooms.filter.guestsMin", { count: 2 }) },
              { value: 3, label: t("rooms.filter.guestsMin", { count: 3 }) },
              { value: 4, label: t("rooms.filter.guestsMin", { count: 4 }) },
            ]}
          />
        </div>
        <label className="room-filter-field">
          <span>{t("rooms.filter.price")} <b>{maxPrice.toLocaleString(lang === "en" ? "en-US" : "vi-VN")} ₫</b></span>
          <input
            type="range"
            min={2000000}
            max={25000000}
            step={500000}
            value={maxPrice}
            onChange={(event) => update({ maxPrice: Number(event.target.value) })}
          />
        </label>
      </div>

      <style>{`
        .room-filter-bar { padding: 26px 30px 30px; border: 1px solid rgba(181,154,107,.34); border-radius: 12px; background: rgba(251,248,242,.96); box-shadow: 0 18px 44px rgba(38,30,26,.12); }
        .room-filter-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
        .room-filter-eyebrow { margin: 0 0 7px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
        .room-filter-heading h2 { margin: 0; color: var(--espresso); font: 500 34px/1 var(--font-display); letter-spacing: -.03em; }
        .room-filter-actions { display: flex; align-items: center; gap: 12px; }
        .room-compare-button, .room-reset-button { min-height: 42px; padding: 0 14px; border-radius: 6px; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
        .room-compare-button { border: 1px solid var(--espresso); background: var(--espresso); color: var(--warm-ivory); }
        .room-compare-button:hover:not(:disabled) { background: var(--walnut); border-color: var(--walnut); }
        .room-compare-button:disabled { cursor: not-allowed; opacity: .36; }
        .room-reset-button { border: 0; background: transparent; color: var(--taupe); text-decoration: underline; text-underline-offset: 4px; }
        .room-filter-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.25fr; gap: 18px; padding-top: 24px; }
        .room-filter-field { display: grid; align-content: start; gap: 9px; min-width: 0; }
        .room-filter-field > span { color: var(--taupe); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .room-filter-field > span b { float: right; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: 0; text-transform: none; }
        .room-filter-grid input[type="search"] { width: 100%; min-height: 46px; border: 1px solid #d9cfc3; border-radius: 7px; background: var(--warm-ivory); color: var(--espresso); padding: 0 12px; font-size: 12px; outline: none; }
        .room-filter-grid input[type="search"]:focus { border-color: var(--antique-brass); box-shadow: 0 0 0 3px rgba(181,154,107,.15); }
        .room-filter-grid input[type="range"] { width: 100%; min-height: 44px; accent-color: var(--antique-brass); }
        @media (max-width: 760px) {
          .room-filter-bar { padding: 22px 18px; }
          .room-filter-heading { align-items: start; flex-direction: column; }
          .room-filter-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) { .room-filter-grid { grid-template-columns: 1fr; } .room-filter-actions { width: 100%; justify-content: space-between; } }
      `}</style>
    </div>
  );
}
