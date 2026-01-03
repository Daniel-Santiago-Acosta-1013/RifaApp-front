import { Link } from "react-router-dom";

const features = [
  {
    title: "Numeros claros",
    description: "Grid ordenado con formatos 00-99 o 000-999.",
  },
  {
    title: "Reserva temporal",
    description: "Aparta numeros por minutos mientras confirmas.",
  },
  {
    title: "Modo vendedor",
    description: "Crea y controla rifas desde un panel limpio.",
  },
];

type OnboardingProps = {
  title?: string;
  subtitle?: string;
  note?: string;
};

const Onboarding = ({
  title = "Rifas estilo colombiano en modo demo",
  subtitle = "Compra y organiza rifas con saldo simulado en COP.",
  note = "Proyecto educativo: el flujo de compra es simulado.",
}: OnboardingProps) => (
  <section className="page onboarding">
    <div className="card onboarding-card">
      <p className="eyebrow">RifaApp</p>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
      <div className="hero-actions">
        <Link className="btn btn-primary" to="/register">
          Crear cuenta
        </Link>
        <Link className="btn btn-ghost" to="/login">
          Ya tengo cuenta
        </Link>
      </div>
      <div className="onboarding-features">
        {features.map((item) => (
          <div className="feature-item" key={item.title}>
            <span className="feature-dot" />
            <div>
              <p className="feature-title">{item.title}</p>
              <p className="feature-text">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="note">{note}</p>
    </div>
  </section>
);

export default Onboarding;
