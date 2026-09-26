interface Dice3DProps {
  value: number;
  rolling?: boolean;
  selected?: boolean;
  used?: boolean;
  bonus?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9]
};

function DiceFace({ value, face }: { value: number; face: string }) {
  return (
    <span className={`ccn-cube-face ${face}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => {
        const slot = index + 1;
        return (
          <i
            key={slot}
            className={PIPS[value].includes(slot) ? 'pip on' : 'pip'}
          />
        );
      })}
    </span>
  );
}

export default function Dice3D({
  value,
  rolling = false,
  selected = false,
  used = false,
  bonus = false,
  disabled = false,
  onClick
}: Dice3DProps) {
  const safeValue = Math.min(6, Math.max(1, Math.round(value || 1)));
  return (
    <button
      type="button"
      className={[
        'ccn-cube-button',
        `show-${safeValue}`,
        rolling ? 'rolling' : '',
        selected ? 'selected' : '',
        used ? 'used' : '',
        bonus ? 'bonus' : ''
      ].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
      aria-label={rolling ? 'Xúc xắc đang lăn' : `Xúc xắc mặt ${safeValue}`}
    >
      <span className="ccn-cube-stage">
        <span className="ccn-dice-cube">
          <DiceFace value={1} face="front" />
          <DiceFace value={6} face="back" />
          <DiceFace value={2} face="right" />
          <DiceFace value={5} face="left" />
          <DiceFace value={3} face="top" />
          <DiceFace value={4} face="bottom" />
        </span>
      </span>
      {bonus && !rolling && <small>+1 🎲</small>}
    </button>
  );
}
