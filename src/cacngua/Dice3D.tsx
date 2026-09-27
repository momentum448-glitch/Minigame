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

function DieShell({
  children,
  rolling = false
}: {
  children: React.ReactNode;
  rolling?: boolean;
}) {
  return (
    <span className={rolling ? 'ccn-roll-shell' : 'ccn-settled-die'} aria-hidden="true">
      <span className={rolling ? 'ccn-roll-top' : 'ccn-settled-top'} />
      <span className={rolling ? 'ccn-roll-side' : 'ccn-settled-side'} />
      {children}
    </span>
  );
}

function RollingDieVisual() {
  const sequence = [2, 5, 1, 6, 4, 3];

  return (
    <DieShell rolling>
      <span className="ccn-roll-face-stack">
        {sequence.map((faceValue, index) => (
          <span
            key={faceValue}
            className="ccn-roll-frame"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <PipGrid value={faceValue} />
          </span>
        ))}
      </span>
    </DieShell>
  );
}

function SettledDie({ value }: { value: number }) {
  return (
    <DieShell>
      <span className="ccn-settled-face">
        <PipGrid value={value} />
      </span>
    </DieShell>
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
        rolling ? 'rolling rolling-2d5' : 'settled',
        selected ? 'selected' : '',
        used ? 'used' : '',
        bonus ? 'bonus' : ''
      ].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
      aria-label={rolling ? 'Xúc xắc đang lăn' : `Xúc xắc mặt ${safeValue}`}
      data-value={safeValue}
    >
      {rolling ? <RollingDieVisual /> : <SettledDie value={safeValue} />}

      {!rolling && (
        <span className="ccn-die-value-badge" aria-hidden="true">
          {safeValue}
        </span>
      )}
      {bonus && !rolling && <small>+1 🎲</small>}
    </button>
  );
}
