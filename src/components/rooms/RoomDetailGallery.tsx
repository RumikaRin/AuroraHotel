"use client";

import { useState } from "react";
import Image from "next/image";
import { RoomLightbox } from "@/components/rooms/RoomLightbox";

interface RoomDetailGalleryProps {
  roomName: string;
  images: string[];
}

export function RoomDetailGallery({ roomName, images }: RoomDetailGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const displayImages = images.length > 0 ? images : ["/images/aurora/deluxe-king.jpg"];

  return (
    <>
      <div className="relative group">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-surface overflow-hidden border border-[var(--brass-hairline)] bg-[var(--bg-surface-card)]">
          {/* Main Hero Image */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="md:col-span-2 relative h-[360px] sm:h-[480px] w-full text-left overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brass)]"
            aria-label={`Xem ảnh lớn của ${roomName}`}
          >
            <Image
              src={displayImages[0]}
              alt={roomName}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wider">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>Xem Thư Viện Ảnh ({displayImages.length})</span>
            </div>
          </button>

          {/* Secondary Stack Images */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {displayImages.slice(1, 3).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="relative h-[170px] sm:h-[230px] w-full text-left overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-brass)] group/sub"
                aria-label={`Xem ảnh ${idx + 2} của ${roomName}`}
              >
                <Image
                  src={img}
                  alt={`${roomName} - góc nhìn ${idx + 2}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/sub:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover/sub:bg-black/0 transition-colors duration-300" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <RoomLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={roomName}
        images={displayImages}
      />
    </>
  );
}
