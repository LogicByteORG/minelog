export function BetaTag({ className }: { className?: string }) {
  return (
    <span
      className={className ? `beta-tag ${className}` : "beta-tag"}
      data-tip="Beta. It works, but details can still change"
    >
      Beta
    </span>
  );
}
