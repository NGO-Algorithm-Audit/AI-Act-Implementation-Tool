import { useEffect, useState } from "react";
import {
  consumePendingGuidelinesBadgeIfMatches,
  getPendingGuidelinesBadge,
  lookupGuidelinesExcerpt,
  subscribePendingGuidelinesBadge,
} from "../utils/guidelinesContent";
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

  // Auto-open this badge's modal when a caller (e.g. SearchBar) has requested
  // it via `requestOpenGuidelinesBadge(label)`. Checks the pending request on
  // mount (handles the case where the request was made before the question
  // screen rendered) and subscribes for subsequent requests (handles the case
  // where the user is already on this screen).
  useEffect(() => {
    if (!excerpt) return;
    if (getPendingGuidelinesBadge() === label) {
      setShow(true);
      consumePendingGuidelinesBadgeIfMatches(label);
    }
    const unsubscribe = subscribePendingGuidelinesBadge((req) => {
      if (req === label) {
        setShow(true);
        consumePendingGuidelinesBadgeIfMatches(label);
      }
    });
    return unsubscribe;
  }, [excerpt, label]);

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
