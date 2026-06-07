import { Fragment, ReactNode } from "react";
import { Modal, Button } from "react-bootstrap";
import type { GuidelinesExcerpt } from "../utils/guidelinesContent";

type Props = {
  show: boolean;
  onHide: () => void;
  label: string;
  excerpt: GuidelinesExcerpt;
  /** Fallback URL to the full EC document (the original badge href). */
  sourceUrl?: string;
};

/** Lightweight markdown-ish renderer for the extracted paragraph text.
 *  Handles `#`-style headings, **bold**, *italic*, blank-line paragraph
 *  breaks, and "–" bullet lines. The source is verbatim pdftotext output
 *  with markdown structure layered on top by the extraction script, so we
 *  keep the renderer minimal. */
function renderParagraphBody(text: string): ReactNode {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, i) => {
    // Single-line heading block: 1-6 `#` chars followed by space + text.
    // Strip the `#` markers and render as a styled subheading. This catches
    // §3.X.Y section headers, lettered sub-bullet headings (#### a) ...) and
    // roman-numeral sub-bullets (##### i. ...) that the extractor folds into
    // paragraph bodies between `**(N)**` markers.
    const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch && !headingMatch[2].includes("\n")) {
      return (
        <h6 key={i} className="guidelines-modal-subheading">
          {renderInline(headingMatch[2])}
        </h6>
      );
    }
    const lines = block.split("\n").map((l) => l.trim());
    const isBulletGroup = lines.every((l) => /^[–-]\s+/.test(l));
    if (isBulletGroup) {
      return (
        <ul key={i} className="guidelines-modal-bullets">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.replace(/^[–-]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{renderInline(block.replace(/\n/g, " "))}</p>;
  });
}

function renderInline(text: string): ReactNode {
  // Split on **bold** first; within each non-bold span split on *italic*.
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return (
      <Fragment key={i}>
        {italicParts.map((ip, j) =>
          /^\*[^*]+\*$/.test(ip) ? <em key={j}>{ip.slice(1, -1)}</em> : <Fragment key={j}>{ip}</Fragment>
        )}
      </Fragment>
    );
  });
}

export default function GuidelinesModal({ show, onHide, label, excerpt, sourceUrl }: Props) {
  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <div style={{ fontSize: "0.85rem", color: "#6c757d", fontWeight: 400 }}>
            {excerpt.section}
          </div>
          <div>{label}</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {excerpt.paragraphs.map(({ number, text }) => (
          <section key={number} className="guidelines-modal-paragraph">
            <h6 className="guidelines-modal-paragraph-num">({number})</h6>
            {renderParagraphBody(text)}
          </section>
        ))}
        {excerpt.missing.length > 0 && (
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Paragraphs not available in the local excerpt: {excerpt.missing.map((n) => `(${n})`).join(", ")}.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        {sourceUrl && (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="me-auto">
            Open full guidelines (EC)
          </a>
        )}
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
