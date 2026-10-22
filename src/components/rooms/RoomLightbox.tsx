"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface RoomLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  images: string[];
}

export function RoomLightbox({ isOpen, onClose, title, images }: RoomLightboxProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(0);
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setActiveIndex((previous) => (previous + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((previous) => (previous - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, images.length]);

  if (!isOpen || images.length === 0) return null;

  const nextImage = () => setActiveIndex((previous) => (previous + 1) % images.length);
  const previousImage = () => setActiveIndex((previous) => (previous - 1 + images.length) % images.length);

  return (
    <div
      className="room-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={t("rooms.lightbox.aria", { name: title })}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="room-lightbox-panel">
        <div className="room-lightbox-header">
          <div>
            <p className="room-lightbox-eyebrow">{t("rooms.lightbox.eyebrow")}</p>
            <h2 id="room-lightbox-title">{title}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="room-lightbox-close" aria-label={t("rooms.lightbox.close")}>×</button>
        </div>

        <div className="room-lightbox-image">
          <Image src={images[activeIndex]} alt={t("rooms.lightbox.image", { name: title, count: activeIndex + 1 })} fill sizes="(max-width: 800px) 100vw, 86vw" priority className="room-lightbox-photo" />
          {images.length > 1 && (
            <>
              <button type="button" onClick={previousImage} className="room-lightbox-arrow left" aria-label={t("rooms.lightbox.previous")}>←</button>
              <button type="button" onClick={nextImage} className="room-lightbox-arrow right" aria-label={t("rooms.lightbox.next")}>→</button>
            </>
          )}
        </div>

        <div className="room-lightbox-footer">
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
          <div className="room-lightbox-thumbs" aria-label={t("rooms.lightbox.choose")}>
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={index === activeIndex ? "active" : ""}
                aria-label={t("rooms.lightbox.view", { count: index + 1 })}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                <Image src={image} alt="" fill sizes="64px" className="room-lightbox-thumb" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
