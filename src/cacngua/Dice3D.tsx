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

function PipGrid({ value }: { value: number }) {
  return (
    <>
      {Array.from({ length: 9 }, (_, index) => {
        const slot = index + 1;
        return (
          <i
            key={slot}
            className={PIPS[value].includes(slot) ? 'pip on' : 'pip'}
          />
        );
      })}
    </>
  );
}

function RollingCube() {
  return (
    <span className="ccn-cube-stage" aria-hidden="true">
      <span className="ccn-dice-cube">
        <span className="ccn-cube-face front"><PipGrid value={1} /></span>
        <span className="ccn-cube-face back"><PipGrid value={6} /></span>
        <span className="ccn-cube-face right"><PipGrid value={3} /></span>
        <span className="ccn-cube-face left"><PipGrid value={4} /></span>
        <span className="ccn-cube-face top"><PipGrid value={2} /></span>
        <span className="ccn-cube-face bottom"><PipGrid value={5} /></span>
      </span>
    </span>
  );
}

function SettledDie({ value }: { value: number }) {
  return (
    <span className="ccn-settled-die" aria-hidden="true">
      <span className="ccn-settled-top" />
      <span className="ccn-settled-side" />
      <span className="ccn-settled-face">
        <PipGrid value={value} />
      </span>
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
        rolling ? 'rolling' : 'settled',
        selected ? 'selected' : '',
        used ? 'used' : '',
        bonus ? 'bonus' : ''
      ].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
      aria-label={rolling ? 'Xúc xắc đang lăn' : `Xúc xắc mặt ${safeValue}`}
      data-value={safeValue}
    >
      {rolling ? <RollingCube /> : <SettledDie value={safeValue} />}

      {!rolling && (
        <span className="ccn-die-value-badge" aria-hidden="true">
          {safeValue}
        </span>
      )}
      {bonus && !rolling && <small>+1 🎲</small>}
    </button>
  );
}
