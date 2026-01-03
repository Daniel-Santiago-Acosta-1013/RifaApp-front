import { Link } from "react-router-dom";

const steps = [
  {
    title: "Cuenta unica para comprar y vender",
    description: "Alterna entre modo comprador y vendedor desde el mismo perfil.",
  },
  {
    title: "Reserva numeros y compra demo",
    description: "Selecciona numeros disponibles con reserva temporal y pago simulado.",
  },
  {
    title: "Administra rifas con claridad",
    description: "Ve progreso, participantes y resultados en un solo panel.",
  },
];

type OnboardingProps = {
  title?: string;
  subtitle?: string;
  note?: string;
};

const Onboarding = ({
  title = "Bienvenido a RifaApp",
  subtitle = "Inicia sesion para desbloquear la experiencia completa de rifas.",
  note = "Proyecto educativo: el flujo de compra es simulado y sin pasarelas.",
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
