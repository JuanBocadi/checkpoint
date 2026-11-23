import type { CSSProperties } from "react";

export function Icon({
  name,
  size = 20,
  style,
}: {
  name: "search" | "gamepad" | "sparkles" | "grid" | "people" | "external";
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {name === "search" && (
        <>
          <circle cx="10.7" cy="10.7" r="6.7" />
          <path d="m16 16 4.5 4.5" />
        </>
      )}
      {name === "gamepad" && (
        <>
          <path d="M7.5 7h9a4 4 0 0 1 3.9 3.2l1 6a2.5 2.5 0 0 1-4.2 2.2L14.6 16H9.4l-2.6 2.4a2.5 2.5 0 0 1-4.2-2.2l1-6A4 4 0 0 1 7.5 7Z" />
          <path d="M6 11h5m-2.5-2.5v5" />
          <circle cx="16" cy="10.5" r=".5" />
          <circle cx="18" cy="13" r=".5" />
        </>
      )}
      {name === "sparkles" && (
        <>
          <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" />
          <path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" />
        </>
      )}
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}
      {name === "people" && (
        <>
          <circle cx="9" cy="7" r="3" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2m1-16a3 3 0 0 1 0 6m3 10v-2a6 6 0 0 0-2-4.5" />
        </>
      )}
      {name === "external" && (
        <>
          <rect x="9" y="3" width="12" height="12" rx="2" />
          <path d="M5 9H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
        </>
      )}
    </svg>
  );
}
