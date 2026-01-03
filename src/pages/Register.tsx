import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page narrow">
      <div className="section-header">
        <p className="eyebrow">Registro</p>
        <h2>Crear cuenta</h2>
        <p className="subtitle">Tu cuenta unica activa modo comprador y vendedor.</p>
      </div>
      <form className="form card" onSubmit={handleSubmit}>
        <div className="field">
          <label>Nombre</label>
          <input
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Contrasena</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <div className="state error">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
        <p className="form-footer">
          Ya tienes cuenta? <Link to="/login">Ingresa aqui</Link>
        </p>
      </form>
    </section>
  );
};

export default RegisterPage;
