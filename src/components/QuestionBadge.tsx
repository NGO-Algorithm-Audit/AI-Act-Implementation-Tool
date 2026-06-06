import { useState } from "react";
import { lookupGuidelinesExcerpt } from "../utils/guidelinesContent";
import GuidelinesModal from "./GuidelinesModal";

interface QuestionBadgeProps {
  label: string;
  color?: string;
  href?: string;
}

export default function QuestionBadge({
  label,
  color = "#005AA7",
  href,
}: QuestionBadgeProps) {
  const excerpt = lookupGuidelinesExcerpt(label);
  const [show, setShow] = useState(false);

  const badge = (
    <span className="question-badge" style={{ backgroundColor: color }}>
      {label}
    </span>
  );

  if (excerpt) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShow(true)}
          className="question-badge-link question-badge-button"
        >
          {badge}
        </button>
        <GuidelinesModal
          show={show}
          onHide={() => setShow(false)}
          label={label}
          excerpt={excerpt}
          sourceUrl={href}
        />
      </>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="question-badge-link"
      >
        {badge}
      </a>
    );
  }

  return badge;
}
