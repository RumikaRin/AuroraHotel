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
    </div>
  );
}
