import { useApp } from "../context/AppContext";

const ModeSwitch = () => {
  const { mode, setMode } = useApp();

  return (
    <div className="mode-switch" role="tablist" aria-label="Selecciona modo">
      <button
        type="button"
        className={`mode-option ${mode === "buy" ? "active" : ""}`}
        onClick={() => setMode("buy")}
        role="tab"
        aria-selected={mode === "buy"}
      >
        Comprar
      </button>
      <button
        type="button"
        className={`mode-option ${mode === "sell" ? "active" : ""}`}
        onClick={() => setMode("sell")}
        role="tab"
        aria-selected={mode === "sell"}
      >
        Vender
      </button>
    </div>
  );
};

export default ModeSwitch;
