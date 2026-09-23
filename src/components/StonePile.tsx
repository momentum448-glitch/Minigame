interface StonePileProps {
  count: number;
  quan?: boolean;
}

export function StonePile({ count, quan = false }: StonePileProps) {
  const visible = Math.min(count, 8);
  return (
    <div className="stones" aria-hidden="true">
      {Array.from({ length: visible }, (_, i) => <span key={i} className="stone" />)}
      {quan && <span className="quan-stone">Q</span>}
    </div>
  );
}
