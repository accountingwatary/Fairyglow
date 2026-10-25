"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { MOODS, PALETTE, SIZES, STEPS } from "@/components/custom-options";
import { WaIcon } from "@/components/wa-icon";
import { customMessage, whatsappLink } from "@/lib/format";

const LABELS = [...STEPS, "Review"];
const REVIEW = STEPS.length;

function swatchColor(color: string) {
  return PALETTE.find((item) => item.name === color)?.hex ?? color;
}

export function CustomWizard({ whatsapp }: { whatsapp: string }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"next" | "back">("next");
  const [colors, setColors] = useState<string[]>([]);
  const [custom, setCustom] = useState("#8dff9a");
  const [size, setSize] = useState("");
  const [mood, setMood] = useState("");
  const [otherMood, setOtherMood] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  const ready = Boolean(whatsappLink(whatsapp, "x"));
  const chosenMood = mood === "Other" ? otherMood.trim() : mood;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    titleRef.current?.focus({ preventScroll: true });
    const root = rootRef.current;
    if (root && root.getBoundingClientRect().top < 0) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  }, [step]);

  function problem(index: number) {
    if (index === 1 && !size) return "Choose a size.";
    if (index === 2 && !mood) return "Choose a mood.";
    if (index === 2 && !chosenMood) return "Describe the mood you want.";
    return "";
  }

  function go(target: number) {
    if (target === step) return;
    if (target > step) {
      for (let index = step; index < target; index++) {
        const message = problem(index);
        if (message) {
          setDir("next");
          setStep(index);
          setError(message);
          return;
        }
      }
    }
    setError("");
    setDir(target > step ? "next" : "back");
    setStep(target);
  }

  function toggle(color: string) {
    setColors((current) => (current.includes(color) ? current.filter((item) => item !== color) : [...current, color]));
  }

  function addCustom() {
    const value = custom.toUpperCase();
    setColors((current) => (current.includes(value) ? current : [...current, value]));
  }

  function send() {
    const link = whatsappLink(whatsapp, customMessage({ colors, size, mood: chosenMood, details }));
    if (!link) return;
    const opened = window.open(link, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = link;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < REVIEW) go(step + 1);
    else send();
  }

  const progress = `${(Math.min(step + 1, REVIEW) / REVIEW) * 100}%`;

  return (
    <form ref={rootRef} className="custom-form wizard" onSubmit={submit} noValidate>
      <div className="wizard-progress">
        <p className="wizard-count" aria-live="polite">
          {step < REVIEW ? `Step ${step + 1} of ${REVIEW}` : "Final check"}
          <span>{LABELS[step]}</span>
        </p>
        <div className="wizard-bar" aria-hidden="true">
          <span style={{ "--progress": progress } as CSSProperties} />
        </div>
        <ol className="wizard-dots">
          {LABELS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                className={index === step ? "wizard-dot now" : index < step ? "wizard-dot done" : "wizard-dot"}
                aria-current={index === step ? "step" : undefined}
                onClick={() => go(index)}
              >
                <span>{index < REVIEW ? index + 1 : "✓"}</span>
                <small>{label}</small>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <section key={step} className={`custom-step wizard-panel from-${dir}`} aria-labelledby="wizard-title">
        <h2 id="wizard-title" ref={titleRef} tabIndex={-1} className="wizard-title">
          {step < REVIEW ? <span>0{step + 1}</span> : null}
          {step === 0 ? "Pick your colors" : null}
          {step === 1 ? "Choose a size" : null}
          {step === 2 ? "Set the mood" : null}
          {step === 3 ? "Describe your bottle" : null}
          {step === REVIEW ? "Review your bottle" : null}
        </h2>

        {step === 0 ? (
          <>
            <p className="fine">Optional. Pick as many as you like, or skip and leave it to us.</p>
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
          </>
        ) : null}

        {step === 1 ? (
          <div className="choices three wizard-sizes">
            {SIZES.map((option) => (
              <label key={option.value} className={size === option.value ? "choice on" : "choice"}>
                <input
                  type="radio"
                  name="size"
                  value={option.value}
                  checked={size === option.value}
                  onChange={() => {
                    setSize(option.value);
                    setError("");
                  }}
                />
                <span className={`size-icon size-${option.value.toLowerCase()}`} aria-hidden="true" />
                <strong>{option.value}</strong>
                <small>{option.hint}</small>
              </label>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <>
            <div className="choices wizard-moods">
              {MOODS.map((option) => (
                <label key={option} className={mood === option ? "choice pill on" : "choice pill"}>
                  <input
                    type="radio"
                    name="mood"
                    value={option}
                    checked={mood === option}
                    onChange={() => {
                      setMood(option);
                      setError("");
                    }}
                  />
                  <strong>{option}</strong>
                </label>
              ))}
            </div>
            {mood === "Other" ? (
              <input
                className="custom-input"
                value={otherMood}
                onChange={(event) => {
                  setOtherMood(event.target.value);
                  setError("");
                }}
                maxLength={80}
                placeholder="Cottagecore, ocean witch, vintage…"
                aria-label="Describe the mood"
                autoFocus
              />
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className="fine">Optional. Anything that makes it yours.</p>
            <textarea
              className="custom-input"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              placeholder="Flowers, crystals, a name, a gift for someone, a photo you will send…"
              aria-label="Description"
            />
            <p className="wizard-counter">{details.length}/1000</p>
          </>
        ) : null}

        {step === REVIEW ? (
          <dl className="wizard-review">
            <div>
              <dt>Colors</dt>
              <dd>
                {colors.length > 0 ? (
                  <span className="wizard-colors">
                    {colors.map((color) => (
                      <span key={color} className="wizard-chip">
                        <i style={{ "--swatch": swatchColor(color) } as CSSProperties} />
                        {color}
                      </span>
                    ))}
                  </span>
                ) : (
                  "Your choice"
                )}
              </dd>
              <button type="button" className="wizard-edit" onClick={() => go(0)} aria-label="Edit colors">
                Edit
              </button>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{size}</dd>
              <button type="button" className="wizard-edit" onClick={() => go(1)} aria-label="Edit size">
                Edit
              </button>
            </div>
            <div>
              <dt>Mood</dt>
              <dd>{chosenMood}</dd>
              <button type="button" className="wizard-edit" onClick={() => go(2)} aria-label="Edit mood">
                Edit
              </button>
            </div>
            <div>
              <dt>Details</dt>
              <dd className={details.trim() ? "wizard-details" : "wizard-empty"}>{details.trim() || "Nothing added"}</dd>
              <button type="button" className="wizard-edit" onClick={() => go(3)} aria-label="Edit details">
                Edit
              </button>
            </div>
          </dl>
        ) : null}

        {step === REVIEW ? (
          <p className="fine">{ready ? "This opens WhatsApp with your choices written out. Just press send." : "Ordering on WhatsApp is not set up yet."}</p>
        ) : null}
      </section>

      {error ? (
        <p className="note banner-bad" role="alert">
          {error}
        </p>
      ) : null}

      <div className="wizard-nav">
        <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          Back
        </button>
        {step < REVIEW ? (
          <button type="submit" className="btn btn-glow">
            {step === REVIEW - 1 ? "Review" : "Next"}
          </button>
        ) : (
          <button type="submit" className="btn btn-glow btn-order" disabled={!ready}>
            <WaIcon />
            Ask for a quotation
          </button>
        )}
      </div>
    </form>
  );
}
