import React, { useState } from "react";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="#005AA7" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Collapsible section, folded by default. Shared styling used by the
// "Overview of roles and responsibilities" and "Export results" accordions.
export default function AccordionSection({
  label,
  children,
  noBorder,
}: {
  label: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: noBorder ? "none" : "1px solid var(--cma-primary)", paddingBottom: "8px", paddingTop: "8px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        type="button"
        style={{
          background: open ? "var(--cma-primary-200)" : "var(--cma-primary-50)",
          border: "1px solid var(--cma-primary-300)",
          borderRadius: open ? "6px 6px 0 0" : "6px",
          padding: "6px 10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "100%",
        }}
        aria-expanded={open}
      >
        <ChevronIcon open={open} />
        <small style={{ color: "#005AA7", fontWeight: "bold" }}>{label}</small>
      </button>
      {open && (
        <div style={{ border: "1px solid var(--cma-primary-300)", borderTop: "none", borderRadius: "0 0 6px 6px", padding: "12px", backgroundColor: "#fff" }}>
          {children}
        </div>
      )}
    </div>
  );
}
