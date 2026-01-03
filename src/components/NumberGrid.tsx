import type { RaffleNumber } from "../types";

type NumberGridProps = {
  numbers: RaffleNumber[];
  selectedNumbers: number[];
  onToggle: (value: number) => void;
  disabled?: boolean;
  reservedNumbers?: number[];
};

const NumberGrid = ({ numbers, selectedNumbers, onToggle, disabled, reservedNumbers = [] }: NumberGridProps) => {
  const selectedSet = new Set(selectedNumbers);
  const reservedSet = new Set(reservedNumbers);

  return (
    <div className="number-grid" role="grid" aria-label="Selector de numeros">
      {numbers.map((item) => {
        const isSelected = selectedSet.has(item.number);
        const isReservedByUser = reservedSet.has(item.number);
        const isDisabled = disabled || item.status !== "available";
        return (
          <button
            key={item.number}
            type="button"
            className={`number-cell status-${item.status} ${isSelected ? "selected" : ""} ${
              isReservedByUser ? "mine" : ""
            }`}
            onClick={() => onToggle(item.number)}
            disabled={isDisabled}
            role="gridcell"
            aria-pressed={isSelected}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default NumberGrid;
