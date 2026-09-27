import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="wrap page-intro">
        <p className="eyebrow">Missing</p>
        <h1>This bottle isn’t on the shelf.</h1>
        <Link className="btn btn-glow" href="/shop">
          Return to the shelf
        </Link>
      </div>
    </main>
  );
}
