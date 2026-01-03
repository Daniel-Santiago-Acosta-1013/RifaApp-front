import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getRaffle, purchaseTickets } from "../api/client";
import Onboarding from "../components/Onboarding";
import { useAuth } from "../context/AuthContext";
import type { Raffle, TicketPurchaseResponse } from "../types";

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

const RaffleDetailPage = () => {
  const { raffleId } = useParams();
  const { user } = useAuth();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [purchaseResult, setPurchaseResult] = useState<TicketPurchaseResponse | null>(null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [quantity, setQuantity] = useState("1");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    if (!raffleId) {
      setError("Rifa no encontrada");
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    getRaffle(raffleId)
      .then((data) => {
        if (active) {
          setRaffle(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Error al cargar la rifa");
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
  }, [raffleId, user]);

  if (!user) {
    return (
      <Onboarding
        title="Registra tu cuenta para participar"
        subtitle="Necesitas iniciar sesion para comprar boletos y ver el detalle de cada rifa."
      />
    );
  }

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const total = useMemo(() => {
    if (!raffle) {
      return 0;
    }
    const price = Number.parseFloat(raffle.ticket_price);
    const qty = Number.parseInt(quantity, 10);
    if (Number.isNaN(price) || Number.isNaN(qty)) {
      return 0;
    }
    return price * qty;
  }, [raffle, quantity]);

  const handleReview = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setPurchaseError("Ingresa un nombre para continuar");
      return;
    }
    const qty = Number.parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      setPurchaseError("Cantidad invalida");
      return;
    }
    setPurchaseError(null);
    setStep("review");
  };

  const handleConfirm = async () => {
    if (!raffle) {
      return;
    }
    setPurchaseLoading(true);
    setPurchaseError(null);
    try {
      const response = await purchaseTickets(raffle.id, {
        participant: {
          name: name.trim(),
          email: email.trim() || undefined,
        },
        quantity: Number.parseInt(quantity, 10),
      });
      setPurchaseResult(response);
      setStep("done");
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Error al comprar boletos");
      setStep("form");
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return <div className="state">Cargando rifa...</div>;
  }

  if (error || !raffle) {
    return <div className="state error">{error || "Rifa no encontrada"}</div>;
  }

  const isOpen = raffle.status === "open";
  const progress = Math.min(100, (raffle.tickets_sold / raffle.total_tickets) * 100);

  return (
    <section className="page">
      <div className="detail-grid">
        <div className="card">
          <div className="raffle-card-header">
            <span className={`status-pill status-${raffle.status}`}>{raffle.status}</span>
            <span className="price">{formatMoney(raffle.ticket_price, raffle.currency)}</span>
          </div>
          <h2>{raffle.title}</h2>
          <p>{raffle.description || "Esta rifa espera tu toque creativo."}</p>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-meta">
            <span>
              {raffle.tickets_sold} / {raffle.total_tickets} boletos vendidos
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="detail-meta">
            <div>
              <span>Estado</span>
              <strong>{raffle.status}</strong>
            </div>
            <div>
              <span>Sorteo</span>
              <strong>{raffle.draw_at ? new Date(raffle.draw_at).toLocaleString() : "Pendiente"}</strong>
            </div>
          </div>
          <Link className="btn btn-ghost" to="/">
            Volver al catalogo
          </Link>
        </div>

        <div className="card purchase-card">
          <h3>Compra tus boletos</h3>
          {!isOpen && <p className="state">Esta rifa ya no acepta compras.</p>}

          {step === "form" && (
            <form className="form" onSubmit={handleReview}>
              <div className="field">
                <label>Nombre completo</label>
                <input
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  required
                  disabled={!isOpen}
                />
              </div>
              <div className="field">
                <label>Email (opcional)</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  disabled={!isOpen}
                />
              </div>
              <div className="field">
                <label>Cantidad de boletos</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={!isOpen}
                />
              </div>
              {purchaseError && <div className="state error">{purchaseError}</div>}
              <button className="btn btn-primary" type="submit" disabled={!isOpen}>
                Revisar compra
              </button>
            </form>
          )}

          {step === "review" && (
            <div className="review">
              <p className="review-title">Resumen de compra</p>
              <div className="review-row">
                <span>Comprador</span>
                <strong>{name}</strong>
              </div>
              <div className="review-row">
                <span>Boletos</span>
                <strong>{quantity}</strong>
              </div>
              <div className="review-row">
                <span>Total</span>
                <strong>{formatMoney(total.toFixed(2), raffle.currency)}</strong>
              </div>
              {purchaseError && <div className="state error">{purchaseError}</div>}
              <div className="form-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep("form")}>
                  Editar
                </button>
                <button className="btn btn-primary" type="button" onClick={handleConfirm} disabled={purchaseLoading}>
                  {purchaseLoading ? "Confirmando..." : "Confirmar compra"}
                </button>
              </div>
            </div>
          )}

          {step === "done" && purchaseResult && (
            <div className="review">
              <p className="review-title">Compra completada</p>
              <p className="review-note">
                Tus boletos ya quedaron registrados. Guarda estos numeros para el sorteo.
              </p>
              <div className="ticket-list">
                {purchaseResult.numbers.map((number) => (
                  <span key={number} className="ticket-chip">
                    {number}
                  </span>
                ))}
              </div>
              <div className="review-row">
                <span>Total pagado</span>
                <strong>{formatMoney(purchaseResult.total_price, purchaseResult.currency)}</strong>
              </div>
              <button className="btn btn-primary" type="button" onClick={() => setStep("form")}
                disabled={!isOpen}
              >
                Comprar mas
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RaffleDetailPage;
