import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/format";
import { getParticipantId } from "../utils/participants";
import Onboarding from "../components/Onboarding";
import ModeSwitch from "../components/ModeSwitch";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { balance } = useApp();

  if (!user) {
    return (
      <Onboarding
        title="Tu perfil esta listo"
        subtitle="Crea una cuenta para personalizar tu experiencia."
      />
    );
  }

  const participantId = getParticipantId(user.email);

  return (
    <section className="page">
      <div className="section-header">
        <p className="eyebrow">Perfil</p>
        <h2>Tu cuenta y preferencias</h2>
        <p className="subtitle">Administra tu modo y revisa tu saldo demo.</p>
      </div>

      <div className="card profile-card">
        <div className="profile-row">
          <div>
            <span>Nombre</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
        </div>
        <div className="profile-row">
          <div>
            <span>Saldo demo</span>
            <strong>{formatMoney(balance, "COP")}</strong>
          </div>
          <div>
            <span>Participante</span>
            <strong>{participantId || "Sin compras aun"}</strong>
          </div>
        </div>
        <div className="profile-row">
          <div>
            <span>Modo actual</span>
            <ModeSwitch />
          </div>
          <div>
            <button className="btn btn-ghost" type="button" onClick={logout}>
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
