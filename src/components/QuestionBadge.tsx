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
  const badge = (
    <span className="question-badge" style={{ backgroundColor: color }}>
      {label}
    </span>
  );

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
