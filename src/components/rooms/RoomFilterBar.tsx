"use client";

import { useState } from "react";

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
          <p className="room-filter-eyebrow">Refine your stay</p>
          <h2>Tìm đúng nhịp nghỉ</h2>
        </div>
        <div className="room-filter-actions">
          <button type="button" onClick={onOpenCompare} disabled={selectedCompareCount === 0} className="room-compare-button">
            So sánh {selectedCompareCount > 0 ? `(${selectedCompareCount})` : ""}
          </button>
          <button type="button" onClick={handleReset} className="room-reset-button">Đặt lại</button>
        </div>
      </div>

      <div className="room-filter-grid">
        <label>
          <span>Tên hạng phòng</span>
          <input
            type="search"
            placeholder="Deluxe, Suite, Villa..."
            value={searchQuery}
            onChange={(event) => update({ searchQuery: event.target.value })}
          />
        </label>
        <label>
          <span>Tầm nhìn</span>
          <select value={viewType} onChange={(event) => update({ viewType: event.target.value })}>
            <option value="ALL">Tất cả tầm nhìn</option>
            <option value="OCEAN">Hướng biển</option>
            <option value="GARDEN">Hướng vườn</option>
            <option value="POOL">Hướng hồ bơi</option>
          </select>
        </label>
        <label>
          <span>Sức chứa tối thiểu <b>{minCapacity}+ khách</b></span>
          <select value={minCapacity} onChange={(event) => update({ minCapacity: Number(event.target.value) })}>
            <option value={1}>1+ khách</option>
            <option value={2}>2+ khách</option>
            <option value={3}>3+ khách</option>
            <option value={4}>4+ khách</option>
          </select>
        </label>
        <label>
          <span>Giá tối đa <b>{maxPrice.toLocaleString("vi-VN")} ₫</b></span>
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
        .room-filter-grid label { display: grid; align-content: start; gap: 9px; }
        .room-filter-grid label > span { color: var(--taupe); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .room-filter-grid label > span b { float: right; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: 0; text-transform: none; }
        .room-filter-grid input[type="search"], .room-filter-grid select { width: 100%; min-height: 44px; border: 1px solid #d9cfc3; border-radius: 6px; background: var(--warm-ivory); color: var(--espresso); padding: 0 12px; font-size: 12px; outline: none; }
        .room-filter-grid input[type="search"]:focus, .room-filter-grid select:focus { border-color: var(--antique-brass); box-shadow: 0 0 0 3px rgba(181,154,107,.15); }
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
