import { NavLink, Outlet } from "react-router-dom";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import BottomNav from "./BottomNav";
import ModeSwitch from "./ModeSwitch";
import SidebarNav from "./SidebarNav";

const Layout = () => {
  const { user, logout } = useAuth();
  const { mode } = useApp();

  if (!user) {
    return (
      <div className="public-shell">
        <header className="public-header">
          <div className="brand">
            <span className="brand-mark">R</span>
            <div>
              <p className="brand-name">RifaApp</p>
              <p className="brand-tagline">Rifas estilo colombiano en modo demo.</p>
            </div>
          </div>
        </header>
        <main className="app-main public-main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <p>Proyecto de aprendizaje. Compra simulada sin pasarela de pagos.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand">
            <span className="brand-mark">R</span>
            <div>
              <p className="brand-name">RifaApp</p>
              <p className="brand-tagline">Rifas colombianas en modo demo.</p>
            </div>
          </div>
          {user && (
            <div className="mode-switch-wrapper desktop-only">
              <ModeSwitch />
            </div>
          )}
        </div>
        <SidebarNav />
        <div className="sidebar-footer">
          {user ? (
            <>
              <div className="user-pill">
                <span>{user.name}</span>
                <small>{user.email}</small>
              </div>
              <button className="btn btn-ghost" onClick={logout} type="button">
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink className="btn btn-ghost" to="/login">
                Entrar
              </NavLink>
              <NavLink className="btn btn-primary" to="/register">
                Registro
              </NavLink>
            </>
          )}
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <div className="brand compact">
            <span className="brand-mark">R</span>
            <div>
              <p className="brand-name">RifaApp</p>
              <p className="brand-tagline">{mode === "sell" ? "Modo vendedor" : "Modo comprador"}</p>
            </div>
          </div>
          {user && (
            <div className="mode-switch-wrapper mobile-only">
              <ModeSwitch />
            </div>
          )}
          <div className="auth-inline">
            {user ? (
              <button className="btn btn-ghost" onClick={logout} type="button">
                Salir
              </button>
            ) : (
              <NavLink className="btn btn-ghost" to="/login">
                Entrar
              </NavLink>
            )}
          </div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <p>Proyecto de aprendizaje. Compra simulada sin pasarela de pagos.</p>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
};

export default Layout;
