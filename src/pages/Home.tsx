import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listRaffles } from "../api/client";
import Onboarding from "../components/Onboarding";
import { useAuth } from "../context/AuthContext";
import type { Raffle } from "../types";

const formatMoney = (value: string, currency: string) => {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) {
    return `${value} ${currency}`;
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(numeric);
};

const HomePage = () => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    listRaffles(statusFilter === "all" ? undefined : statusFilter)
      .then((data) => {
        if (active) {
          setRaffles(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar rifas");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [statusFilter, user]);

  if (!user) {
    return <Onboarding />;
  }

  return (
    <section className="page">
      <div className="hero center">
        <p className="eyebrow">Panel de rifas</p>
        <h1>Gestiona tus rifas con una interfaz limpia y centralizada.</h1>
        <p className="subtitle">
          Crea nuevas rifas, revisa su progreso y acompaña el flujo completo desde un solo lugar.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/create">
            Crear rifa
          </Link>
          <button className="btn btn-ghost" type="button" onClick={() => setStatusFilter("open")}>
            Ver abiertas
          </button>
        </div>
      </div>

      <div className="section-header" id="catalogo">
        <div>
          <h2>Catalogo de rifas</h2>
          <p>Explora, revisa progreso y compra boletos en segundos.</p>
        </div>
        <div className="filters">
          {[
            { value: "all", label: "Todas" },
            { value: "open", label: "Abiertas" },
            { value: "closed", label: "Cerradas" },
            { value: "drawn", label: "Sorteadas" },
          ].map((filter) => (
            <button
              key={filter.value}
              className={`chip ${statusFilter === filter.value ? "active" : ""}`}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="state">Cargando rifas...</div>
      ) : error ? (
        <div className="state error">{error}</div>
      ) : raffles.length === 0 ? (
        <div className="state">Aun no hay rifas para mostrar.</div>
      ) : (
        <div className="raffle-grid">
          {raffles.map((raffle, index) => {
            const progress = Math.min(100, (raffle.tickets_sold / raffle.total_tickets) * 100);
            return (
              <article className="raffle-card" style={{ animationDelay: `${index * 0.05}s` }} key={raffle.id}>
                <div className="raffle-card-header">
                  <span className={`status-pill status-${raffle.status}`}>{raffle.status}</span>
                  <span className="price">{formatMoney(raffle.ticket_price, raffle.currency)}</span>
                </div>
                <h3>{raffle.title}</h3>
                <p>{raffle.description || "Sin descripcion, pero con muchas ganas de salir."}</p>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-meta">
                  <span>
                    {raffle.tickets_sold} / {raffle.total_tickets} boletos vendidos
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Link className="btn btn-primary btn-small" to={`/raffles/${raffle.id}`}>
                  Ver detalle
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HomePage;
