import { useState } from "react";
import { Link } from "react-router-dom";

import { createRaffle } from "../api/client";
import Onboarding from "../components/Onboarding";
import { useAuth } from "../context/AuthContext";

const CreateRafflePage = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("5");
  const [currency, setCurrency] = useState("USD");
  const [totalTickets, setTotalTickets] = useState("50");
  const [drawAt, setDrawAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  if (!user) {
    return (
      <Onboarding
        title="Necesitas una cuenta para crear rifas"
        subtitle="Registra tu perfil para desbloquear la creacion de rifas y el panel completo."
      />
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedId(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        ticket_price: Number(ticketPrice),
        currency: currency.toUpperCase(),
        total_tickets: Number(totalTickets),
        draw_at: drawAt ? new Date(drawAt).toISOString() : undefined,
      };
      const raffle = await createRaffle(payload);
      setCreatedId(raffle.id);
      setTitle("");
      setDescription("");
      setTicketPrice("5");
      setCurrency("USD");
      setTotalTickets("50");
      setDrawAt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la rifa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="section-header">
        <p className="eyebrow">Nueva rifa</p>
        <h2>Crear nueva rifa</h2>
        <p className="subtitle">Define la historia, el precio y el momento del sorteo.</p>
      </div>

      <form className="form card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label>Titulo</label>
            <input
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Rifa de tecnologia"
              required
            />
          </div>
          <div className="field">
            <label>Moneda</label>
            <input
              className="input"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              maxLength={3}
            />
          </div>
        </div>
        <div className="field">
          <label>Descripcion</label>
          <textarea
            className="input textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Cuenta por que esta rifa es especial."
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Precio por boleto</label>
            <input
              className="input"
              type="number"
              min="1"
              step="0.5"
              value={ticketPrice}
              onChange={(event) => setTicketPrice(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Total de boletos</label>
            <input
              className="input"
              type="number"
              min="1"
              value={totalTickets}
              onChange={(event) => setTotalTickets(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Fecha del sorteo (opcional)</label>
            <input
              className="input"
              type="datetime-local"
              value={drawAt}
              onChange={(event) => setDrawAt(event.target.value)}
            />
          </div>
        </div>
        {error && <div className="state error">{error}</div>}
        {createdId && (
          <div className="state success">
            Rifa creada con exito. <Link to={`/raffles/${createdId}`}>Ver detalle</Link>
          </div>
        )}
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear rifa"}
          </button>
          <Link className="btn btn-ghost" to="/">
            Volver al catalogo
          </Link>
        </div>
      </form>
    </section>
  );
};

export default CreateRafflePage;
