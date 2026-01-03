import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { confirmPurchase, getRaffleNumbers, getRaffleV2, releaseReservation, reserveNumbers } from "../api/client";
import NumberGrid from "../components/NumberGrid";
import Onboarding from "../components/Onboarding";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import type { PurchaseConfirmResponse, RaffleNumber, RaffleV2, ReservationResponse } from "../types";
import { formatDate, formatMoney } from "../utils/format";
import { setParticipantId } from "../utils/participants";

const RaffleDetailPage = () => {
  const { raffleId } = useParams();
  const { user } = useAuth();
  const { balance, debit } = useApp();
  const [raffle, setRaffle] = useState<RaffleV2 | null>(null);
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);
  const [purchase, setPurchase] = useState<PurchaseConfirmResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!raffleId) {
      setError("Rifa no encontrada");
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [raffleData, numbersData] = await Promise.all([
          getRaffleV2(raffleId),
          getRaffleNumbers(raffleId),
        ]);
        setRaffle(raffleData);
        setNumbers(numbersData.numbers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la rifa");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [raffleId, user]);

  useEffect(() => {
    if (!reservation?.expires_at) {
      setTimeLeft(null);
      return;
    }
    const interval = window.setInterval(() => {
      const now = Date.now();
      const expiry = new Date(reservation.expires_at).getTime();
      const diff = Math.max(0, expiry - now);
      if (diff <= 0) {
        setTimeLeft("00:00");
        setReservation(null);
        setSelectedNumbers([]);
        if (raffleId) {
          Promise.all([getRaffleV2(raffleId), getRaffleNumbers(raffleId)]).then(([raffleData, numbersData]) => {
            setRaffle(raffleData);
            setNumbers(numbersData.numbers);
          });
        }
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [reservation]);

  const totalSelected = useMemo(() => {
    const price = raffle ? Number.parseFloat(raffle.ticket_price) : 0;
    if (!Number.isFinite(price)) {
      return 0;
    }
    return price * selectedNumbers.length;
  }, [raffle, selectedNumbers.length]);

  const toggleNumber = (value: number) => {
    if (reservation) {
      return;
    }
    setSelectedNumbers((prev) =>
      prev.includes(value) ? prev.filter((number) => number !== value) : [...prev, value],
    );
  };

  const handleReserve = async () => {
    if (!raffleId || !user) {
      return;
    }
    if (selectedNumbers.length === 0) {
      setPurchaseError("Selecciona al menos un numero.");
      return;
    }
    setProcessing(true);
    setPurchaseError(null);
    try {
      const response = await reserveNumbers(raffleId, {
        participant: { name: user.name, email: user.email },
        numbers: selectedNumbers,
        ttl_minutes: 10,
      });
      setReservation(response);
      setParticipantId(user.email, response.participant_id);
      const [refreshedRaffle, refreshedNumbers] = await Promise.all([
        getRaffleV2(raffleId),
        getRaffleNumbers(raffleId),
      ]);
      setRaffle(refreshedRaffle);
      setNumbers(refreshedNumbers.numbers);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "No se pudo reservar");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!raffleId || !reservation) {
      return;
    }
    const total = Number.parseFloat(reservation.total_price);
    if (!Number.isFinite(total)) {
      setPurchaseError("Total invalido");
      return;
    }
    if (balance < total) {
      setPurchaseError("Saldo insuficiente. Recarga saldo demo.");
      return;
    }
    setProcessing(true);
    setPurchaseError(null);
    try {
      const response = await confirmPurchase(raffleId, {
        reservation_id: reservation.reservation_id,
        participant_id: reservation.participant_id,
        payment_method: "demo",
      });
      debit(total);
      setPurchase(response);
      setReservation(null);
      setSelectedNumbers([]);
      const [refreshedRaffle, refreshedNumbers] = await Promise.all([
        getRaffleV2(raffleId),
        getRaffleNumbers(raffleId),
      ]);
      setRaffle(refreshedRaffle);
      setNumbers(refreshedNumbers.numbers);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "No se pudo confirmar");
    } finally {
      setProcessing(false);
    }
  };

  const handleRelease = async () => {
    if (!raffleId || !reservation) {
      return;
    }
    setProcessing(true);
    try {
      await releaseReservation(raffleId, reservation.reservation_id);
      setReservation(null);
      setSelectedNumbers([]);
      const [refreshedRaffle, refreshedNumbers] = await Promise.all([
        getRaffleV2(raffleId),
        getRaffleNumbers(raffleId),
      ]);
      setRaffle(refreshedRaffle);
      setNumbers(refreshedNumbers.numbers);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "No se pudo liberar la reserva");
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <Onboarding
        title="Registra tu cuenta para participar"
        subtitle="Necesitas iniciar sesion para comprar numeros y ver el detalle de cada rifa."
      />
    );
  }

  if (loading) {
    return <div className="state">Cargando rifa...</div>;
  }

  if (error || !raffle) {
    return <div className="state error">{error || "Rifa no encontrada"}</div>;
  }

  const progress = Math.min(100, (raffle.tickets_sold / raffle.total_tickets) * 100);
  const isOpen = raffle.status === "open";

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
              {raffle.tickets_sold} / {raffle.total_tickets} vendidos
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="detail-meta">
            <div>
              <span>Inicio</span>
              <strong>#{raffle.number_start}</strong>
            </div>
            <div>
              <span>Fin</span>
              <strong>#{raffle.number_end}</strong>
            </div>
            <div>
              <span>Sorteo</span>
              <strong>{formatDate(raffle.draw_at)}</strong>
            </div>
            <div>
              <span>Reservados</span>
              <strong>{raffle.tickets_reserved}</strong>
            </div>
          </div>
          <Link className="btn btn-ghost" to="/">
            Volver al catalogo
          </Link>
        </div>

        <div className="card purchase-card">
          <h3>Selecciona tus numeros</h3>
          {!isOpen && <p className="state">Esta rifa ya no acepta compras.</p>}
          <NumberGrid
            numbers={numbers}
            selectedNumbers={selectedNumbers}
            reservedNumbers={reservation?.numbers}
            onToggle={toggleNumber}
            disabled={!isOpen || Boolean(reservation)}
          />
          <div className="selection-summary">
            <div>
              <span>Seleccionados</span>
              <strong>{selectedNumbers.length}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatMoney(totalSelected, raffle.currency)}</strong>
            </div>
          </div>
          {reservation && (
            <div className="reservation-banner">
              <span>Reserva activa</span>
              <strong>{timeLeft || "00:00"}</strong>
            </div>
          )}
          {purchaseError && <div className="state error">{purchaseError}</div>}
          {!reservation && (
            <button className="btn btn-primary" type="button" onClick={handleReserve} disabled={!isOpen || processing}>
              {processing ? "Reservando..." : "Reservar numeros"}
            </button>
          )}
          {reservation && !purchase && (
            <div className="form-actions">
              <button className="btn btn-ghost" type="button" onClick={handleRelease} disabled={processing}>
                Cancelar reserva
              </button>
              <button className="btn btn-primary" type="button" onClick={handleConfirm} disabled={processing}>
                {processing ? "Confirmando..." : "Confirmar compra"}
              </button>
            </div>
          )}
          {purchase && (
            <div className="review">
              <p className="review-title">Compra completada</p>
              <p className="review-note">Estos numeros quedan guardados para el sorteo.</p>
              <div className="ticket-list">
                {purchase.numbers.map((number) => (
                  <span key={number} className="ticket-chip">
                    {number}
                  </span>
                ))}
              </div>
              <div className="review-row">
                <span>Total pagado</span>
                <strong>{formatMoney(purchase.total_price, purchase.currency)}</strong>
              </div>
              <Link className="btn btn-ghost btn-small" to="/purchases">
                Ver mis compras
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RaffleDetailPage;
