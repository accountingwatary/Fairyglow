"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function DriftRow({ children, direction, label }: { children: ReactNode; direction: "left" | "right"; label: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = scroller.current;
    const inner = track.current;
    if (!box || !inner) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sign = direction === "left" ? -1 : 1;
    let frame = 0;
    let visible = false;
    let current = 0;
    let target = 0;
    let range = 0;

    const readRange = () => {
      range = parseFloat(getComputedStyle(box).getPropertyValue("--drift")) || 0;
    };

    const measure = () => {
      if (motion.matches) {
        target = 0;
        return;
      }
      const rect = box.getBoundingClientRect();
      const height = window.innerHeight || 1;
      const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - height / 2) / (height / 2 + rect.height / 2)));
      target = -progress * sign * range;
    };

    const tick = () => {
      frame = 0;
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.1) current = target;
      inner.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;
      if (current !== target) frame = requestAnimationFrame(tick);
    };

    const update = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (visible) update();
    };

    const onResize = () => {
      readRange();
      update();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) update();
    });
    observer.observe(box);

    readRange();
    measure();
    current = target;
    inner.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    motion.addEventListener("change", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [direction]);

  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    let startX = 0;
    let startLeft = 0;
    let pointer: number | null = null;
    let moved = false;

    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pointer = event.pointerId;
      startX = event.clientX;
      startLeft = box.scrollLeft;
      moved = false;
    };

    const move = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      const delta = event.clientX - startX;
      if (!moved && Math.abs(delta) > 6) {
        moved = true;
        box.classList.add("dragging");
        box.setPointerCapture(event.pointerId);
      }
      if (moved) box.scrollLeft = startLeft - delta;
    };

    const up = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      box.classList.remove("dragging");
      if (box.hasPointerCapture(event.pointerId)) box.releasePointerCapture(event.pointerId);
    };

    const click = (event: MouseEvent) => {
      if (!moved) return;
      moved = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const drag = (event: DragEvent) => event.preventDefault();

    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    box.addEventListener("click", click, true);
    box.addEventListener("dragstart", drag);

    return () => {
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerup", up);
      box.removeEventListener("pointercancel", up);
      box.removeEventListener("click", click, true);
      box.removeEventListener("dragstart", drag);
    };
  }, []);

  return (
    <div className="drift-scroller" ref={scroller} role="region" aria-label={label} tabIndex={0}>
      <div className="drift-track" ref={track}>
        {children}
      </div>
    </div>
  );
}
