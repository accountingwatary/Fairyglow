"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page">
      <div className="wrap page-intro">
        <p className="eyebrow">Interrupted</p>
        <h1>The lights flickered.</h1>
        <p className="lede">This page could not be opened.</p>
        <button className="btn btn-glow" type="button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  );
}
