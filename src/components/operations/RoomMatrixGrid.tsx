"use client";

import { useState } from "react";

export interface MatrixRoomItem {
  id: string;
  roomNumber: string;
  floor: number;
  categoryName: string;
  status: "CLEAN" | "DIRTY" | "INSPECTING" | "MAINTENANCE" | "OCCUPIED";
  occupancyStatus?: "VACANT" | "ARRIVAL" | "OCCUPIED" | "DUE_OUT";
  housekeepingStatus?: "CLEAN" | "DIRTY" | "INSPECTING" | "MAINTENANCE";
  guestName?: string;
  checkOutDate?: string;
}

interface RoomMatrixGridProps {
  rooms: MatrixRoomItem[];
  onStatusChange?: (roomId: string, newStatus: MatrixRoomItem["status"]) => void;
  isHousekeeperView?: boolean;
}

export function RoomMatrixGrid({ rooms, onStatusChange, isHousekeeperView = false }: RoomMatrixGridProps) {
  const [selectedRoom, setSelectedRoom] = useState<MatrixRoomItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Group rooms by floor
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  const filteredRooms = rooms.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter || r.housekeepingStatus === statusFilter || r.occupancyStatus === statusFilter;
  });

  const getStatusBadgeClass = (status: MatrixRoomItem["status"]) => {
    switch (status) {
      case "CLEAN":
        return "bg-emerald-600 text-white border-emerald-700";
      case "OCCUPIED":
        return "bg-blue-600 text-white border-blue-700";
      case "DIRTY":
        return "bg-rose-600 text-white border-rose-700";
      case "INSPECTING":
        return "bg-amber-600 text-white border-amber-700";
      case "MAINTENANCE":
        return "bg-slate-700 text-white border-slate-800";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusTextVi = (status: string) => {
    switch (status) {
      case "CLEAN": return "Sạch (Ready)";
      case "OCCUPIED": return "Có Khách";
      case "VACANT": return "Phòng Trống";
      case "DIRTY": return "Cần Dọn";
      case "INSPECTING": return "Đang Kiểm Tra";
      case "MAINTENANCE": return "Bảo Trì";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="glass-luxury p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-aurora-gold/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-aurora-midnight uppercase tracking-wider">
            Lọc Theo Trạng Thái:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "CLEAN", "OCCUPIED", "DIRTY", "INSPECTING", "MAINTENANCE"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-aurora-midnight text-aurora-gold shadow-sm"
                    : "bg-white text-aurora-muted hover:text-aurora-midnight border border-aurora-line"
                }`}
              >
                {st === "ALL" ? "Tất Cả" : getStatusTextVi(st as MatrixRoomItem["status"])}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-aurora-muted font-medium flex items-center gap-2">
          {isHousekeeperView && (
            <span className="px-2 py-0.5 rounded bg-aurora-gold/20 text-aurora-midnight font-bold text-[10px] uppercase">
              Chế Độ Buồng Phòng
            </span>
          )}
          Hiển thị <span className="font-bold text-aurora-midnight">{filteredRooms.length}</span> / {rooms.length} phòng
        </div>
      </div>

      {/* Floor by Floor Grid */}
      {floors.map((floor) => {
        const floorRooms = filteredRooms.filter((r) => r.floor === floor);
        if (floorRooms.length === 0) return null;

        return (
          <div key={floor} className="bg-white rounded-2xl p-6 border border-aurora-line shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-aurora-line pb-3">
              <h3 className="font-serif-luxury text-xl font-bold text-aurora-midnight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-aurora-gold inline-block" />
                Tầng {floor}
              </h3>
              <span className="text-xs text-aurora-muted font-medium">
                {floorRooms.length} phòng
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {floorRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between text-left transition-all duration-200 cursor-pointer hover:scale-[1.03] shadow-sm ${getStatusBadgeClass(
                    room.status
                  )}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-lg tracking-wider">
                      P.{room.roomNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 uppercase font-semibold">
                      Tầng {room.floor}
                    </span>
                  </div>

                  <div className="text-xs truncate opacity-90 font-medium mb-2">
                    {room.categoryName}
                  </div>

                  <div className="pt-2 border-t border-white/20 text-[11px] font-bold flex justify-between items-center">
                    <span>{getStatusTextVi(room.status)}</span>
                    {room.guestName && (
                      <span className="truncate max-w-[80px] font-normal opacity-90">
                        {room.guestName}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-aurora-gold/30 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-aurora-line">
              <div>
                <span className="text-xs font-mono text-aurora-gold font-bold block">
                  CHI TIẾT PHÒNG #{selectedRoom.roomNumber}
                </span>
                <h4 className="font-serif-luxury text-xl font-bold text-aurora-midnight">
                  {selectedRoom.categoryName} (Tầng {selectedRoom.floor})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-aurora-midnight transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-xs text-aurora-ink">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-aurora-muted">Trạng Thái Hiện Tại:</span>
                <span className="font-bold text-aurora-midnight">
                  {getStatusTextVi(selectedRoom.status)}
                </span>
              </div>
              {selectedRoom.guestName && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-aurora-muted">Khách Đang Lưu Trú:</span>
                  <span className="font-semibold">{selectedRoom.guestName}</span>
                </div>
              )}
              {selectedRoom.checkOutDate && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-aurora-muted">Ngày Dự Kiến Check-out:</span>
                  <span className="font-semibold">{selectedRoom.checkOutDate}</span>
                </div>
              )}
            </div>

            {/* Change Status Controls for Staff */}
            {onStatusChange && (
              <div className="pt-3 border-t border-aurora-line space-y-2">
                <label className="block text-xs font-bold text-aurora-midnight uppercase tracking-wider">
                  Cập Nhật Trạng Thái Mới:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["CLEAN", "DIRTY", "INSPECTING", "MAINTENANCE"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        onStatusChange(selectedRoom.id, st);
                        setSelectedRoom({ ...selectedRoom, status: st });
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between ${
                        selectedRoom.status === st
                          ? "bg-aurora-midnight text-aurora-gold border-aurora-midnight"
                          : "bg-gray-50 text-aurora-midnight border-aurora-line hover:border-aurora-gold"
                      }`}
                    >
                      <span>{getStatusTextVi(st)}</span>
                      {selectedRoom.status === st && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
