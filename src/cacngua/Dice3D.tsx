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

function PipFace({
  value,
  face,
  result = false
}: {
  value: number;
  face: string;
  result?: boolean;
}) {
  return (
    <span
      className={`ccn-cube-face ${face} ${result ? 'result-face' : 'decorative-face'}`}
      aria-hidden="true"
    >
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
        rolling ? 'rolling' : '',
        selected ? 'selected' : '',
        used ? 'used' : '',
        bonus ? 'bonus' : ''
      ].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
      aria-label={rolling ? 'Xúc xắc đang lăn' : `Xúc xắc mặt ${safeValue}`}
      data-value={safeValue}
    >
      <span className="ccn-cube-stage">
        <span className="ccn-dice-cube">
          {/* Result is ALWAYS rendered on the front face.
              This avoids Android/WebView backface-selection bugs while
              keeping a full six-face cube during the roll animation. */}
          <PipFace value={safeValue} face="front" result />
          <PipFace value={6} face="back" />
          <PipFace value={3} face="right" />
          <PipFace value={4} face="left" />
          <PipFace value={2} face="top" />
          <PipFace value={5} face="bottom" />
        </span>
      </span>

      {!rolling && (
        <span className="ccn-die-value-badge" aria-hidden="true">
          {safeValue}
        </span>
      )}
      {bonus && !rolling && <small>+1 🎲</small>}
    </button>
  );
}
