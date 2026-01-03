import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listRafflesV2 } from "../api/client";
import Onboarding from "../components/Onboarding";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import type { RaffleV2 } from "../types";
import { formatDate, formatMoney } from "../utils/format";

const HomePage = () => {
  const { user } = useAuth();
  const { mode, balance } = useApp();
  const [raffles, setRaffles] = useState<RaffleV2[]>([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [search, setSearch] = useState("");
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
    listRafflesV2(statusFilter === "all" ? undefined : statusFilter)
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

  const filteredRaffles = useMemo(() => {
    if (!search.trim()) {
      return raffles;
    }
    const term = search.trim().toLowerCase();
    return raffles.filter(
      (raffle) =>
        raffle.title.toLowerCase().includes(term) ||
        (raffle.description || "").toLowerCase().includes(term),
    );
  }, [raffles, search]);

  const totalSold = raffles.reduce((sum, raffle) => sum + raffle.tickets_sold, 0);
  const totalReserved = raffles.reduce((sum, raffle) => sum + raffle.tickets_reserved, 0);
  const totalRevenue = raffles.reduce((sum, raffle) => {
    const price = Number.parseFloat(raffle.ticket_price);
    return sum + (Number.isFinite(price) ? price * raffle.tickets_sold : 0);
  }, 0);

  return (
    <section className="page">
      {mode === "sell" ? (
        <>
          <div className="hero">
            <div>
              <p className="eyebrow">Panel vendedor</p>
              <h1>Gestiona tus rifas con un tablero claro y accionable.</h1>
              <p className="subtitle">
                Controla ventas, reservas y estado de sorteo desde un solo lugar.
              </p>
            </div>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/create">
                Crear rifa
              </Link>
              <Link className="btn btn-ghost" to="/sell/raffles">
                Ver mis rifas
              </Link>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Rifas activas</p>
              <strong>{raffles.filter((raffle) => raffle.status === "open").length}</strong>
            </div>
            <div className="stat-card">
              <p>Boletos vendidos</p>
              <strong>{totalSold}</strong>
            </div>
            <div className="stat-card">
              <p>Reservas vigentes</p>
              <strong>{totalReserved}</strong>
            </div>
            <div className="stat-card highlight">
              <p>Ingreso demo</p>
              <strong>{formatMoney(totalRevenue, "COP")}</strong>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="hero">
            <div>
              <p className="eyebrow">Explorar rifas</p>
              <h1>Elige tus numeros con calma y compra en modo demo.</h1>
              <p className="subtitle">
                Tu saldo simulado esta listo para probar el flujo completo de compra.
              </p>
            </div>
            <div className="hero-actions">
              <div className="balance-card">
                <p>Saldo demo</p>
                <strong>{formatMoney(balance, "COP")}</strong>
              </div>
              <Link className="btn btn-ghost" to="/wallet">
                Administrar saldo
              </Link>
            </div>
          </div>
        </>
      )}

      <div className="section-header split">
        <div>
          <h2>{mode === "sell" ? "Estado general" : "Rifas disponibles"}</h2>
          <p>{mode === "sell" ? "Revisa el progreso de cada rifa." : "Selecciona tu rifa favorita."}</p>
        </div>
        <div className="filters">
          {[
            { value: "all", label: "Todas" },
            { value: "open", label: "Abiertas" },
            { value: "closed", label: "Cerradas" },
            { value: "drawn", label: "Sorteadas" },
            { value: "draft", label: "Borradores" },
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
      <div className="search-row">
        <input
          className="input"
          placeholder="Buscar por titulo o descripcion"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="state">Cargando rifas...</div>
      ) : error ? (
        <div className="state error">{error}</div>
      ) : filteredRaffles.length === 0 ? (
        <div className="state">Aun no hay rifas para mostrar.</div>
      ) : (
        <div className="raffle-grid">
          {filteredRaffles.map((raffle) => {
            const progress = Math.min(100, (raffle.tickets_sold / raffle.total_tickets) * 100);
            return (
              <article className="raffle-card" key={raffle.id}>
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
                    {raffle.tickets_sold} / {raffle.total_tickets} vendidos
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="raffle-meta">
                  <span>Numero {raffle.number_start}</span>
                  <span>Sorteo {formatDate(raffle.draw_at)}</span>
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
