import { NavLink } from "react-router-dom";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const BottomNav = () => {
  const { mode } = useApp();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const items =
    mode === "sell"
      ? [
          { to: "/", label: "Panel" },
          { to: "/sell/raffles", label: "Mis rifas" },
          { to: "/create", label: "Crear" },
          { to: "/profile", label: "Perfil" },
        ]
      : [
          { to: "/", label: "Explorar" },
          { to: "/purchases", label: "Mis compras" },
          { to: "/wallet", label: "Saldo" },
          { to: "/profile", label: "Perfil" },
        ];

  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
