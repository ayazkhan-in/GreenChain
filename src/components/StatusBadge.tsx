interface Props {
  status: "verified" | "pending";
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        status === "verified"
          ? "bg-secondary text-secondary-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === "verified" ? "bg-primary" : "bg-muted-foreground"}`} />
      {status}
    </span>
  );
}
