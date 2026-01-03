import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { createRaffleV2 } from "../api/client";
import Onboarding from "../components/Onboarding";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/format";

const numberFormats = [
  { id: "00-99", label: "00 - 99", number_start: 0, number_padding: 2, total_tickets: 100 },
  { id: "000-999", label: "000 - 999", number_start: 0, number_padding: 3, total_tickets: 1000 },
  { id: "1-100", label: "1 - 100", number_start: 1, number_padding: null, total_tickets: 100 },
  { id: "1-1000", label: "1 - 1000", number_start: 1, number_padding: null, total_tickets: 1000 },
  { id: "custom", label: "Personalizado", number_start: 1, number_padding: null, total_tickets: 50 },
];

const CreateRafflePage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("5000");
  const [currency, setCurrency] = useState("COP");
  const [formatId, setFormatId] = useState("00-99");
  const [totalTickets, setTotalTickets] = useState("100");
  const [numberStart, setNumberStart] = useState("0");
  const [numberPadding, setNumberPadding] = useState("2");
  const [drawAt, setDrawAt] = useState("");
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  if (!user) {
    return (
      <Onboarding
        title="Necesitas una cuenta para crear rifas"
        subtitle="Registra tu perfil para desbloquear la creacion de rifas."
      />
    );
  }

  const format = useMemo(() => numberFormats.find((item) => item.id === formatId), [formatId]);

  const handleFormatChange = (nextId: string) => {
    setFormatId(nextId);
    const selected = numberFormats.find((item) => item.id === nextId);
    if (!selected) {
      return;
    }
    setTotalTickets(String(selected.total_tickets));
    setNumberStart(String(selected.number_start));
    setNumberPadding(selected.number_padding ? String(selected.number_padding) : "");
  };

  const totalPreview = useMemo(() => {
    const price = Number.parseFloat(ticketPrice);
    const qty = Number.parseInt(totalTickets, 10);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) {
      return 0;
    }
    return price * qty;
  }, [ticketPrice, totalTickets]);

  const goNext = () => setStep((prev) => Math.min(prev + 1, 4));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
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
        number_start: Number(numberStart),
        number_padding: numberPadding ? Number(numberPadding) : null,
        status,
      };
      const raffle = await createRaffleV2(payload);
      setCreatedId(raffle.id);
      setStep(4);
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
        <h2>Crea tu rifa paso a paso</h2>
        <p className="subtitle">Define historia, numeros, precio y fecha en minutos.</p>
      </div>

      <div className="wizard">
        <div className="wizard-steps">
          {["Idea", "Numeros", "Fecha", "Confirmar"].map((label, index) => (
            <div key={label} className={`wizard-step ${step === index + 1 ? "active" : ""}`}>
              <span>{index + 1}</span>
              <p>{label}</p>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="card form">
            <div className="field">
              <label>Titulo</label>
              <input
                className="input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Rifa iPhone 15"
                required
              />
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
            <div className="form-actions">
              <button className="btn btn-primary" type="button" onClick={goNext} disabled={!title.trim()}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card form">
            <div className="form-row">
              <div className="field">
                <label>Precio por numero (COP)</label>
                <input
                  className="input"
                  type="number"
                  min="1000"
                  step="500"
                  value={ticketPrice}
                  onChange={(event) => setTicketPrice(event.target.value)}
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
              <label>Formato de numeros</label>
              <div className="chip-grid">
                {numberFormats.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`chip ${formatId === item.id ? "active" : ""}`}
                    onClick={() => handleFormatChange(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {format?.id === "custom" && (
              <div className="form-row">
                <div className="field">
                  <label>Numero inicial</label>
                  <input
                    className="input"
                    type="number"
                    value={numberStart}
                    onChange={(event) => setNumberStart(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Relleno (digitos)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={numberPadding}
                    onChange={(event) => setNumberPadding(event.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="field">
              <label>Total de numeros</label>
              <input
                className="input"
                type="number"
                min="1"
                value={totalTickets}
                onChange={(event) => setTotalTickets(event.target.value)}
              />
            </div>
            <div className="summary-card">
              <span>Recaudo estimado</span>
              <strong>{formatMoney(totalPreview, currency)}</strong>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" type="button" onClick={goBack}>
                Volver
              </button>
              <button className="btn btn-primary" type="button" onClick={goNext}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card form">
            <div className="field">
              <label>Fecha del sorteo (opcional)</label>
              <input
                className="input"
                type="datetime-local"
                value={drawAt}
                onChange={(event) => setDrawAt(event.target.value)}
              />
            </div>
            <div className="field">
              <label>Estado inicial</label>
              <div className="chip-grid">
                {[
                  { value: "open", label: "Publicar ahora" },
                  { value: "draft", label: "Guardar borrador" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip ${status === item.value ? "active" : ""}`}
                    onClick={() => setStatus(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" type="button" onClick={goBack}>
                Volver
              </button>
              <button className="btn btn-primary" type="button" onClick={goNext}>
                Revisar
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card form">
            <h3>Resumen final</h3>
            <div className="review-row">
              <span>Titulo</span>
              <strong>{title || "Sin titulo"}</strong>
            </div>
            <div className="review-row">
              <span>Formato</span>
              <strong>{format?.label}</strong>
            </div>
            <div className="review-row">
              <span>Precio</span>
              <strong>{formatMoney(ticketPrice, currency)}</strong>
            </div>
            <div className="review-row">
              <span>Total numeros</span>
              <strong>{totalTickets}</strong>
            </div>
            <div className="review-row">
              <span>Sorteo</span>
              <strong>{drawAt || "Sin fecha"}</strong>
            </div>
            {error && <div className="state error">{error}</div>}
            {createdId && (
              <div className="state success">
                Rifa creada con exito. <Link to={`/raffles/${createdId}`}>Ver detalle</Link>
              </div>
            )}
            <div className="form-actions">
              <button className="btn btn-ghost" type="button" onClick={goBack} disabled={loading}>
                Volver
              </button>
              <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creando..." : "Crear rifa"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreateRafflePage;
