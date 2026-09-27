"use client";

export function ConfirmSubmit({ label, message }: { label: string; message: string }) {
  return (
    <button
      className="btn btn-danger"
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
