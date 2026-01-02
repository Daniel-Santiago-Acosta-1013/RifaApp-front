import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">R</span>
          <div>
            <p className="brand-name">RifaApp</p>
            <p className="brand-tagline">Rifas digitales, cero drama.</p>
          </div>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>
            Rifas
          </NavLink>
          <NavLink to="/create">Crear</NavLink>
        </nav>
        <div className="auth-block">
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
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>Proyecto de aprendizaje. Compra simulada sin pasarela de pagos.</p>
      </footer>
    </div>
  );
};

export default Layout;
