interface QuestionBadgeProps {
  label: string;
  color?: string;
}

export default function QuestionBadge({
  label,
  color = "#005AA7",
}: QuestionBadgeProps) {
  return (
    <span
      className="question-badge"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
