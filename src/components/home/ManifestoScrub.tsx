"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const MANIFESTO_TEXT =
  "Chúng tôi không đơn thuần xây dựng một khách sạn nghỉ dưỡng. Chúng tôi kiến tạo nơi trú ẩn của tâm hồn giữa vách đá sa thạch và bờ vịnh hoang sơ. Nơi mỗi căn phòng mở toang đón gió đại dương, và thời gian trôi đi theo nhịp thở êm đềm của từng con sóng vỗ bờ.";

export function ManifestoScrub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !textRef.current || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const words = textRef.current.querySelectorAll(".manifesto-word");
    const triggers: ScrollTrigger[] = [];

    words.forEach((word) => {
      const st = ScrollTrigger.create({
        trigger: word,
        start: "top 75%",
        onEnter: () => {
          word.classList.remove("opacity-25");
          word.classList.add("opacity-100");
        },
        onLeaveBack: () => {
          word.classList.remove("opacity-100");
          word.classList.add("opacity-25");
        },
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, []);

  const words = MANIFESTO_TEXT.split(/\s+/);

  return (
    <section
      className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] transition-colors duration-500"
      id="manifesto"
      ref={containerRef}
    >
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] tracking-[0.24em] uppercase text-[var(--accent-brass)] border-b border-[var(--brass-hairline)] pb-6 mb-16 gap-2 font-medium">
          <span>TRIẾT LÝ KIẾN TRÚC & NGHỈ DƯỠNG TĨNH TẠI</span>
          <span>SƠN TRÀ PENINSULA · KHU BẢO TỒN TỰ NHIÊN NGUYÊN SINH</span>
        </div>

        <p
          ref={textRef}
          className="font-serif-luxury text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] font-light leading-[1.35] tracking-wide"
        >
          {words.map((word, index) => (
            <span
              key={index}
              className="manifesto-word inline-block mr-[0.28em] text-[var(--text-primary)] opacity-25 transition-opacity duration-300"
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
