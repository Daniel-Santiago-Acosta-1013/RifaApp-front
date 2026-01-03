import { Link } from "react-router-dom";

const steps = [
  {
    title: "Registra tu cuenta",
    description: "Guarda tus datos para comprar y crear rifas sin friccion.",
  },
  {
    title: "Explora rifas activas",
    description: "Consulta disponibilidad, precios y fechas en tiempo real.",
  },
  {
    title: "Compra boletos",
    description: "Simula el flujo completo sin pasarela de pagos.",
  },
];

type OnboardingProps = {
  title?: string;
  subtitle?: string;
  note?: string;
};

const Onboarding = ({
  title = "Bienvenido a RifaApp",
  subtitle = "Registra tu cuenta para crear y comprar rifas con seguridad.",
  note = "Proyecto educativo: el flujo de compra es simulado.",
}: OnboardingProps) => (
  <section className="page onboarding">
    <div className="card onboarding-card">
      <p className="eyebrow">RifaApp</p>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
      <div className="cta-row">
        <Link className="btn btn-primary" to="/register">
          Crear cuenta
        </Link>
        <Link className="btn btn-ghost" to="/login">
          Ya tengo cuenta
        </Link>
      </div>
      <div className="onboarding-steps">
        {steps.map((step, index) => (
          <div className="step" key={step.title}>
            <span className="step-index">0{index + 1}</span>
            <div>
              <p className="step-title">{step.title}</p>
              <p className="step-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="note">{note}</p>
    </div>
  </section>
);

export default Onboarding;
