import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listRafflesV2 } from "../api/client";
import Onboarding from "../components/Onboarding";
import { useAuth } from "../context/AuthContext";
import type { RaffleV2 } from "../types";
import { formatDate, formatMoney } from "../utils/format";

const SellRafflesPage = () => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState<RaffleV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listRafflesV2()
      .then((data) => {
        setRaffles(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error al cargar rifas");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Onboarding
        title="Inicia sesion para gestionar rifas"
        subtitle="Tu panel de vendedor se activa con una cuenta."
      />
    );
  }

  return (
    <section className="page">
      <div className="section-header">
        <p className="eyebrow">Mis rifas</p>
        <h2>Inventario y progreso</h2>
        <p className="subtitle">Vista general del estado de cada rifa creada.</p>
      </div>
      {loading ? (
        <div className="state">Cargando rifas...</div>
      ) : error ? (
        <div className="state error">{error}</div>
      ) : raffles.length === 0 ? (
        <div className="state">
          Aun no tienes rifas creadas. <Link to="/create">Crear primera rifa</Link>
        </div>
      ) : (
        <div className="card-list">
          {raffles.map((raffle) => {
            const progress = Math.min(100, (raffle.tickets_sold / raffle.total_tickets) * 100);
            return (
              <article className="card raffle-row" key={raffle.id}>
                <div>
                  <span className={`status-pill status-${raffle.status}`}>{raffle.status}</span>
                  <h3>{raffle.title}</h3>
                  <p className="subtitle">{raffle.description || "Sin descripcion."}</p>
                </div>
                <div className="raffle-row-metrics">
                  <div>
                    <span>Vendidos</span>
                    <strong>{raffle.tickets_sold}</strong>
                  </div>
                  <div>
                    <span>Reservados</span>
                    <strong>{raffle.tickets_reserved}</strong>
                  </div>
                  <div>
                    <span>Sorteo</span>
                    <strong>{formatDate(raffle.draw_at)}</strong>
                  </div>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="raffle-row-footer">
                  <span>{formatMoney(raffle.ticket_price, raffle.currency)} por numero</span>
                  <Link className="btn btn-ghost btn-small" to={`/raffles/${raffle.id}`}>
                    Ver detalle
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SellRafflesPage;
