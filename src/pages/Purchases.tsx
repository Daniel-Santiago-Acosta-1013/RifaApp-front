import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listPurchases } from "../api/client";
import Onboarding from "../components/Onboarding";
import { useAuth } from "../context/AuthContext";
import type { Purchase } from "../types";
import { formatDate, formatMoney } from "../utils/format";
import { getParticipantId } from "../utils/participants";

const PurchasesPage = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const participantId = getParticipantId(user.email);
    if (!participantId) {
      setPurchases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listPurchases(participantId)
      .then((data) => {
        setPurchases(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error al cargar compras");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Onboarding
        title="Inicia sesion para ver tus compras"
        subtitle="Necesitas una cuenta para consultar tus numeros reservados."
      />
    );
  }

  return (
    <section className="page">
      <div className="section-header">
        <p className="eyebrow">Mis compras</p>
        <h2>Tus numeros y comprobantes demo</h2>
        <p className="subtitle">Historial completo de compras simuladas.</p>
      </div>

      {loading ? (
        <div className="state">Cargando compras...</div>
      ) : error ? (
        <div className="state error">{error}</div>
      ) : purchases.length === 0 ? (
        <div className="state">
          Aun no tienes compras registradas. <Link to="/">Explorar rifas</Link>
        </div>
      ) : (
        <div className="card-list">
          {purchases.map((purchase) => (
            <article className="card purchase-card" key={purchase.purchase_id}>
              <div className="purchase-header">
                <div>
                  <p className="eyebrow">Compra demo</p>
                  <h3>{purchase.raffle_title}</h3>
                  <p className="subtitle">Estado rifa: {purchase.raffle_status}</p>
                </div>
                <div className="purchase-total">
                  <span>Total</span>
                  <strong>{formatMoney(purchase.total_price, purchase.currency)}</strong>
                </div>
              </div>
              <div className="ticket-list">
                {purchase.numbers.map((number) => (
                  <span key={number} className="ticket-chip">
                    {number}
                  </span>
                ))}
              </div>
              <div className="purchase-meta">
                <span>Metodo: {purchase.payment_method || "Demo"}</span>
                <span>{formatDate(purchase.created_at)}</span>
              </div>
              <Link className="btn btn-ghost btn-small" to={`/raffles/${purchase.raffle_id}`}>
                Ver rifa
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PurchasesPage;
