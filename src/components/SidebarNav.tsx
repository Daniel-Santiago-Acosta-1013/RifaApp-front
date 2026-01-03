import { NavLink } from "react-router-dom";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const SidebarNav = () => {
  const { mode } = useApp();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const items =
    mode === "sell"
      ? [
          { to: "/", label: "Panel vendedor" },
          { to: "/sell/raffles", label: "Mis rifas" },
          { to: "/create", label: "Crear rifa" },
          { to: "/profile", label: "Perfil" },
        ]
      : [
          { to: "/", label: "Explorar rifas" },
          { to: "/purchases", label: "Mis compras" },
          { to: "/wallet", label: "Saldo demo" },
          { to: "/profile", label: "Perfil" },
        ];

  return (
    <nav className="sidebar-nav" aria-label="Secciones">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default SidebarNav;
