import { useState } from "react";

import Onboarding from "../components/Onboarding";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/format";

const WalletPage = () => {
  const { user } = useAuth();
  const { balance, credit, resetBalance } = useApp();
  const [amount, setAmount] = useState("50000");

  if (!user) {
    return (
      <Onboarding
        title="Activa tu saldo demo"
        subtitle="Inicia sesion para simular compras con saldo de prueba."
      />
    );
  }

  const handleCredit = () => {
    const value = Number(amount);
    if (Number.isFinite(value) && value > 0) {
      credit(value);
      setAmount("50000");
    }
  };

  return (
    <section className="page">
      <div className="section-header">
        <p className="eyebrow">Saldo demo</p>
        <h2>Simula tus compras en COP</h2>
        <p className="subtitle">Recarga saldo cuando quieras, sin pasarelas reales.</p>
      </div>

      <div className="card">
        <div className="wallet-balance">
          <span>Disponible</span>
          <strong>{formatMoney(balance, "COP")}</strong>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Monto a recargar</label>
            <input
              className="input"
              type="number"
              min="1000"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="button" onClick={handleCredit}>
            Recargar saldo
          </button>
        </div>
        <div className="quick-actions">
          {[20000, 50000, 100000].map((value) => (
            <button key={value} className="chip" type="button" onClick={() => credit(value)}>
              +{formatMoney(value, "COP")}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-small" type="button" onClick={resetBalance}>
          Reiniciar saldo demo
        </button>
      </div>
    </section>
  );
};

export default WalletPage;
