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

      <style>{`
        .room-lightbox-backdrop { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 24px; background: rgba(25,21,18,.9); backdrop-filter: blur(12px); }
        .room-lightbox-panel { width: min(1080px, 100%); max-height: calc(100vh - 48px); overflow: auto; padding: 22px; border: 1px solid rgba(181,154,107,.42); border-radius: 12px; background: var(--espresso); color: var(--warm-ivory); box-shadow: 0 30px 100px rgba(0,0,0,.35); }
        .room-lightbox-header { display: flex; align-items: start; justify-content: space-between; gap: 20px; padding-bottom: 18px; }
        .room-lightbox-eyebrow { margin: 0 0 6px; color: var(--antique-brass); font-size: 9px; font-weight: 700; letter-spacing: .17em; text-transform: uppercase; }
        .room-lightbox-header h2 { margin: 0; font: 500 clamp(28px, 4vw, 48px)/.95 var(--font-display); }
        .room-lightbox-close { width: 44px; height: 44px; border: 1px solid rgba(243,238,231,.3); border-radius: 50%; background: transparent; color: var(--warm-ivory); font-size: 26px; line-height: 1; }
        .room-lightbox-close:hover { border-color: var(--antique-brass); color: var(--antique-brass); }
        .room-lightbox-image { position: relative; height: min(62vh, 620px); overflow: hidden; border-radius: 8px; background: var(--warm-carbon); }
        .room-lightbox-photo { object-fit: cover; }
        .room-lightbox-arrow { position: absolute; top: 50%; width: 48px; height: 48px; transform: translateY(-50%); border: 1px solid rgba(251,248,242,.4); border-radius: 50%; background: rgba(25,21,18,.56); color: var(--warm-ivory); font-size: 20px; backdrop-filter: blur(8px); }
        .room-lightbox-arrow:hover { background: var(--antique-brass); color: var(--espresso); }
        .room-lightbox-arrow.left { left: 18px; }
        .room-lightbox-arrow.right { right: 18px; }
        .room-lightbox-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-top: 16px; color: rgba(243,238,231,.68); font-size: 11px; }
        .room-lightbox-thumbs { display: flex; gap: 8px; overflow-x: auto; }
        .room-lightbox-thumbs button { position: relative; width: 64px; height: 46px; flex: 0 0 auto; overflow: hidden; border: 1px solid transparent; border-radius: 5px; opacity: .58; }
        .room-lightbox-thumbs button.active, .room-lightbox-thumbs button:hover { border-color: var(--antique-brass); opacity: 1; }
        .room-lightbox-thumb { object-fit: cover; }
        @media (max-width: 560px) { .room-lightbox-backdrop { padding: 10px; } .room-lightbox-panel { padding: 14px; max-height: calc(100vh - 20px); } .room-lightbox-image { height: 58vh; } .room-lightbox-footer { align-items: start; flex-direction: column; } }
      `}</style>
    </div>
  );
}
