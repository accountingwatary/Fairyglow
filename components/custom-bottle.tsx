"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { WaIcon } from "@/components/wa-icon";
import { customMessage, whatsappLink } from "@/lib/format";

const PALETTE = [
  { name: "Moss green", hex: "#3f6b3a" },
  { name: "Lime glow", hex: "#d8ff57" },
  { name: "Midnight black", hex: "#0b0d0c" },
  { name: "Amethyst", hex: "#7b4bb3" },
  { name: "Moonlight silver", hex: "#c9d1d3" },
  { name: "Ember gold", hex: "#d9a441" },
  { name: "Blood red", hex: "#8e1b24" },
  { name: "Deep ocean", hex: "#1f4e79" },
  { name: "Rose", hex: "#e58fb1" },
  { name: "Snow white", hex: "#f4f4ef" },
];

const SIZES = [
  { value: "Small", hint: "Palm size" },
  { value: "Medium", hint: "Shelf size" },
  { value: "Large", hint: "Centerpiece" },
];

const MOODS = ["Classic", "Gothic", "Ambient", "Enchanted forest", "Celestial", "Other"];

export function CustomBottle({ whatsapp }: { whatsapp: string }) {
  const [colors, setColors] = useState<string[]>([]);
  const [custom, setCustom] = useState("#8dff9a");
  const [size, setSize] = useState("");
  const [mood, setMood] = useState("");
  const [otherMood, setOtherMood] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  const ready = Boolean(whatsappLink(whatsapp, "x"));

  function toggle(color: string) {
    setColors((current) => (current.includes(color) ? current.filter((item) => item !== color) : [...current, color]));
  }

  function addCustom() {
    const value = custom.toUpperCase();
    setColors((current) => (current.includes(value) ? current : [...current, value]));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const chosenMood = mood === "Other" ? otherMood.trim() : mood;
    if (!size) return setError("Choose a size.");
    if (!chosenMood) return setError(mood === "Other" ? "Describe the mood you want." : "Choose a mood.");
    setError("");
    const link = whatsappLink(whatsapp, customMessage({ colors, size, mood: chosenMood, details }));
    if (!link) return;
    const opened = window.open(link, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = link;
  }

  return (
    <form className="custom-form" onSubmit={submit} noValidate>
      <fieldset className="custom-step" data-reveal>
        <legend>
          <span>01</span>Colors
        </legend>
        <div className="swatches">
          {PALETTE.map((color) => {
            const on = colors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                className={on ? "swatch on" : "swatch"}
                style={{ "--swatch": color.hex } as CSSProperties}
                aria-pressed={on}
                onClick={() => toggle(color.name)}
              >
                <span className="swatch-dot" />
                {color.name}
              </button>
            );
          })}
          {colors
            .filter((color) => color.startsWith("#"))
            .map((color) => (
              <button
                key={color}
                type="button"
                className="swatch on"
                style={{ "--swatch": color } as CSSProperties}
                aria-pressed="true"
                onClick={() => toggle(color)}
              >
                <span className="swatch-dot" />
                {color}
              </button>
            ))}
        </div>
        <div className="custom-color">
          <label>
            <input type="color" value={custom} onChange={(event) => setCustom(event.target.value)} aria-label="Pick your own color" />
          </label>
          <button type="button" className="btn btn-ghost" onClick={addCustom}>
            Add this color
          </button>
        </div>
      </fieldset>

      <fieldset className="custom-step" data-reveal>
        <legend>
          <span>02</span>Size
        </legend>
        <div className="choices three">
          {SIZES.map((option) => (
            <label key={option.value} className={size === option.value ? "choice on" : "choice"}>
              <input
                type="radio"
                name="size"
                value={option.value}
                checked={size === option.value}
                onChange={() => setSize(option.value)}
              />
              <span className={`size-icon size-${option.value.toLowerCase()}`} aria-hidden="true" />
              <strong>{option.value}</strong>
              <small>{option.hint}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="custom-step" data-reveal>
        <legend>
          <span>03</span>Mood
        </legend>
        <div className="choices">
          {MOODS.map((option) => (
            <label key={option} className={mood === option ? "choice pill on" : "choice pill"}>
              <input type="radio" name="mood" value={option} checked={mood === option} onChange={() => setMood(option)} />
              <strong>{option}</strong>
            </label>
          ))}
        </div>
        {mood === "Other" ? (
          <input
            className="custom-input"
            value={otherMood}
            onChange={(event) => setOtherMood(event.target.value)}
            maxLength={80}
            placeholder="Cottagecore, ocean witch, vintage…"
            autoFocus
          />
        ) : null}
      </fieldset>

      <fieldset className="custom-step" data-reveal>
        <legend>
          <span>04</span>Description
        </legend>
        <textarea
          className="custom-input"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={1000}
          placeholder="Flowers, crystals, a name, a gift for someone, a photo you will send…"
        />
      </fieldset>

      {error ? (
        <p className="note banner-bad" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn btn-glow btn-wide btn-order" type="submit" disabled={!ready}>
        <WaIcon />
        Ask for a quotation
      </button>
    </form>
  );
}
