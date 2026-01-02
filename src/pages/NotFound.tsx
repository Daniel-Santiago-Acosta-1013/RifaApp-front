import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <section className="page narrow">
    <div className="card">
      <h2>Pagina no encontrada</h2>
      <p>La ruta que buscas no existe o fue movida.</p>
      <Link className="btn btn-primary" to="/">
        Volver al inicio
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
