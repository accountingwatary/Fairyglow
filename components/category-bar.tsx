"use client";

import { useEffect, useRef, useState } from "react";

type Category = { id: string; label: string; count: number };

export function CategoryBar({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState("cat-all");
  const bar = useRef<HTMLDivElement>(null);
  const lock = useRef(0);

  useEffect(() => {
    const sections = categories
      .slice(1)
      .map((category) => document.getElementById(category.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (sections.length === 0) return;

    const onScroll = () => {
      if (Date.now() < lock.current) return;
      const line = 170;
      const first = sections[0].getBoundingClientRect().top;
      if (first > line) return setActive("cat-all");
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories]);

  useEffect(() => {
    const chip = bar.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const box = bar.current;
    if (!chip || !box) return;
    const left = chip.offsetLeft - box.clientWidth / 2 + chip.clientWidth / 2;
    box.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  function go(id: string) {
    setActive(id);
    lock.current = Date.now() + 800;
    const target = id === "cat-all" ? bar.current?.parentElement : document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - (id === "cat-all" ? 150 : 140);
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <nav className="cat-bar" aria-label="Categories">
      <div className="cat-chips" ref={bar}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            data-id={category.id}
            className={active === category.id ? "cat-chip on" : "cat-chip"}
            aria-current={active === category.id ? "true" : undefined}
            onClick={() => go(category.id)}
          >
            {category.label}
            <span>{category.count}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
