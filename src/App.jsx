import { useEffect, useRef, useState } from "react";
import "./App.css";

const CLAVE_STORAGE = "plataforma-qa-historias";

const usuariosSimulados = [
  {
    id: "admin-1",
    nombre: "Administrador Sistema",
    rol: "Administrador",
  },
  {
    id: "qe-1",
    nombre: "Jose Seguel", // Puedes poner aquí el nombre que quieras
    rol: "QE",
  },
  {
    id: "qa-1",
    nombre: "Jonathan Choque",
    rol: "Analista QA",
  },
  {
    id: "qa-2",
    nombre: "Pedro Soto",
    rol: "Analista QA",
  },
  {
    id: "qa-3",
    nombre: "Ana Pérez",
    rol: "Analista QA",
  },
];

const nombresEntregables = {
  planPruebas: "Plan de pruebas",
  dashboard: "Dashboard",
  casosPrueba: "Casos de prueba",
  aprobacionCasos: "Aprobación de casos de prueba",
  ejecucion: "Ejecución",
  evidencias: "Evidencias",
  defectos: "Defectos gestionados",
  aprobacionUat: "Aprobación UAT",
  certificado: "Certificado",
  cierrePruebas: "Cierre de pruebas",
};

const entregablesVacios = {
  planPruebas: false,
  dashboard: false,
  casosPrueba: false,
  aprobacionCasos: false,
  ejecucion: false,
  evidencias: false,
  defectos: false,
  aprobacionUat: false,
  certificado: false,
  cierrePruebas: false,
};

const historiasIniciales = [
  {
    id: "HU-101",
    titulo: "Validación de transferencias",
    sprint: "Sprint 1",
    celula: "Pagos",
    prioridad: "Alta",
    analistaId: "qa-1",
    qeResponsableId: "qe-1",
    estado: "En ejecución",
    riesgo: "Alto",
    bloqueo: "Defecto crítico pendiente de corrección",
    entregables: {
      ...entregablesVacios,
      planPruebas: true,
      dashboard: true,
      casosPrueba: true,
      aprobacionCasos: true,
    },
  },
  {
    id: "HU-102",
    titulo: "Consulta de movimientos",
    sprint: "Sprint 1",
    celula: "Pagos",
    prioridad: "Media",
    analistaId: "qa-2",
    qeResponsableId: "qe-1",
    estado: "Diseño de pruebas",
    riesgo: "Medio",
    bloqueo: "Casos de prueba pendientes de aprobación",
    entregables: {
      ...entregablesVacios,
      planPruebas: true,
      dashboard: true,
      casosPrueba: true,
    },
  },
  {
    id: "HU-103",
    titulo: "Actualización de datos personales",
    sprint: "Sprint 1",
    celula: "Clientes",
    prioridad: "Media",
    analistaId: "qa-3",
    qeResponsableId: "qe-1",
    estado: "Pendiente de cierre",
    riesgo: "Bajo",
    bloqueo: "Certificado de pruebas pendiente",
    entregables: {
      ...entregablesVacios,
      planPruebas: true,
      dashboard: true,
      casosPrueba: true,
      aprobacionCasos: true,
      ejecucion: true,
      evidencias: true,
      defectos: true,
      aprobacionUat: true,
    },
  },
  {
    id: "HU-104",
    titulo: "Bloqueo preventivo de tarjeta",
    sprint: "Sprint 1",
    celula: "Tarjetas",
    prioridad: "Alta",
    analistaId: "qa-1",
    qeResponsableId: "qe-1",
    estado: "Cerrada",
    riesgo: "Bajo",
    bloqueo: "Sin bloqueo",
    entregables: Object.fromEntries(
      Object.keys(entregablesVacios).map((clave) => [clave, true])
    ),
  },
];

function calcularCumplimiento(entregables) {
  const estados = Object.values(entregables || {});

  if (estados.length === 0) {
    return 0;
  }

  const completados = estados.filter(Boolean).length;

  return Math.round((completados / estados.length) * 100);
}

function obtenerUsuario(id) {
  return usuariosSimulados.find((usuario) => usuario.id === id);
}

function obtenerNombreUsuario(id) {
  return obtenerUsuario(id)?.nombre || "Sin asignar";
}

function cargarHistorias() {
  const guardadas = localStorage.getItem(CLAVE_STORAGE);

  if (!guardadas) {
    return historiasIniciales;
  }

  try {
    const datos = JSON.parse(guardadas);

    if (!Array.isArray(datos)) {
      return historiasIniciales;
    }

    /*
     * Si todavía existen datos del modelo antiguo
     * sin IDs, volvemos a los datos iniciales.
     */
    const formatoNuevo = datos.every(
      (historia) => historia.analistaId && historia.qeResponsableId
    );

    return formatoNuevo ? datos : historiasIniciales;
  } catch {
    return historiasIniciales;
  }
}

function App() {
  const [historias, setHistorias] = useState(cargarHistorias);

  const [usuarioActualId, setUsuarioActualId] = useState("qe-1");

  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroAnalista, setFiltroAnalista] = useState("Todos");

  const [historiaSeleccionadaId, setHistoriaSeleccionadaId] =
    useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [errorFormulario, setErrorFormulario] = useState("");

  const [nuevaHistoria, setNuevaHistoria] = useState({
    id: "",
    titulo: "",
    sprint: "Sprint 1",
    celula: "",
    prioridad: "Media",
    analistaId: "qa-1",
    qeResponsableId: "qe-1",
    estado: "Pendiente",
    riesgo: "Bajo",
  });

  const detalleRef = useRef(null);

  const usuarioActual = obtenerUsuario(usuarioActualId);

  const historiaSeleccionada = historias.find(
    (historia) => historia.id === historiaSeleccionadaId
  );

  const analistas = usuariosSimulados.filter(
    (usuario) => usuario.rol === "Analista QA"
  );

  const qes = usuariosSimulados.filter(
    (usuario) => usuario.rol === "QE"
  );

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historias));
  }, [historias]);

  useEffect(() => {
    if (historiaSeleccionadaId && detalleRef.current) {
      detalleRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [historiaSeleccionadaId]);

  const historiasPermitidas = historias.filter((historia) => {
    if (usuarioActual.rol === "Administrador") {
      return true;
    }

    if (usuarioActual.rol === "QE") {
      return historia.qeResponsableId === usuarioActual.id;
    }

    if (usuarioActual.rol === "Analista QA") {
      return historia.analistaId === usuarioActual.id;
    }

    return false;
  });

  const estadosDisponibles = [
    ...new Set(historiasPermitidas.map((historia) => historia.estado)),
  ];

  const analistasDisponibles = [
    ...new Set(
      historiasPermitidas.map((historia) => historia.analistaId)
    ),
  ];

  const historiasFiltradas = historiasPermitidas.filter((historia) => {
    const coincideEstado =
      filtroEstado === "Todos" || historia.estado === filtroEstado;

    const coincideAnalista =
      filtroAnalista === "Todos" ||
      historia.analistaId === filtroAnalista;

    return coincideEstado && coincideAnalista;
  });

  const totalHistorias = historiasPermitidas.length;

  const historiasCerradas = historiasPermitidas.filter(
    (historia) => historia.estado === "Cerrada"
  ).length;

  const historiasRiesgoAlto = historiasPermitidas.filter(
    (historia) => historia.riesgo === "Alto"
  ).length;

  const cumplimientoPromedio =
    totalHistorias === 0
      ? 0
      : Math.round(
          historiasPermitidas.reduce(
            (total, historia) =>
              total + calcularCumplimiento(historia.entregables),
            0
          ) / totalHistorias
        );

  function limpiarFiltros() {
    setFiltroEstado("Todos");
    setFiltroAnalista("Todos");
  }

  function cambiarUsuario(id) {
    const nuevoUsuario = obtenerUsuario(id);

    setUsuarioActualId(id);
    setFiltroEstado("Todos");
    setFiltroAnalista("Todos");
    setHistoriaSeleccionadaId(null);
    setMostrarFormulario(false);

    if (nuevoUsuario.rol === "QE") {
      setNuevaHistoria((actual) => ({
        ...actual,
        qeResponsableId: nuevoUsuario.id,
      }));
    }
  }

  function actualizarEntregable(historiaId, clave, nuevoEstado) {
    if (usuarioActual.rol !== "Analista QA") {
      return;
    }

    setHistorias((actuales) =>
      actuales.map((historia) =>
        historia.id === historiaId
          ? {
              ...historia,
              entregables: {
                ...historia.entregables,
                [clave]: nuevoEstado,
              },
            }
          : historia
      )
    );
  }

  function abrirNuevaHistoria() {
    setErrorFormulario("");

    setNuevaHistoria({
      id: "",
      titulo: "",
      sprint: "Sprint 1",
      celula: "",
      prioridad: "Media",
      analistaId: analistas[0]?.id || "",
      qeResponsableId:
        usuarioActual.rol === "QE"
          ? usuarioActual.id
          : qes[0]?.id || "",
      estado: "Pendiente",
      riesgo: "Bajo",
    });

    setMostrarFormulario(true);
  }

  function manejarCambioFormulario(evento) {
    const { name, value } = evento.target;

    setNuevaHistoria((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function crearHistoria(evento) {
    evento.preventDefault();

    const codigo = nuevaHistoria.id.trim().toUpperCase();
    const titulo = nuevaHistoria.titulo.trim();
    const celula = nuevaHistoria.celula.trim();

    if (!codigo || !titulo || !celula) {
      setErrorFormulario(
        "Completa código HU, descripción y célula."
      );
      return;
    }

    const existe = historias.some(
      (historia) => historia.id.toUpperCase() === codigo
    );

    if (existe) {
      setErrorFormulario(
        `La historia ${codigo} ya existe.`
      );
      return;
    }

    const historiaCreada = {
      ...nuevaHistoria,
      id: codigo,
      titulo,
      celula,
      bloqueo: "Sin bloqueo",
      entregables: { ...entregablesVacios },
    };

    setHistorias((actuales) => [...actuales, historiaCreada]);

    setMostrarFormulario(false);
    setErrorFormulario("");
    setHistoriaSeleccionadaId(codigo);
  }

  const puedeCrearHU =
    usuarioActual.rol === "Administrador" ||
    usuarioActual.rol === "QE";

  return (
    <main className="contenedor">

      <section className="barra-usuario">
        <div>
          <span className="barra-usuario-titulo">
            Usuario actual
          </span>

          <strong>{usuarioActual.nombre}</strong>

          <span
            className={`badge-rol badge-${usuarioActual.rol
              .toLowerCase()
              .replaceAll(" ", "-")}`}
          >
            {usuarioActual.rol}
          </span>
        </div>

        <label className="selector-usuario">
          Simular acceso

          <select
            value={usuarioActualId}
            onChange={(evento) =>
              cambiarUsuario(evento.target.value)
            }
          >
            {usuariosSimulados.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre} - {usuario.rol}
              </option>
            ))}
          </select>
        </label>
      </section>

      <header className="encabezado">
        <p className="etiqueta">
          Plataforma de seguimiento QA
        </p>

        <h1>
          {usuarioActual.rol === "Analista QA"
            ? "Mis Historias de Usuario"
            : "Estado de Historias de Usuario"}
        </h1>

        <p>
          Sprint 1 · Seguimiento operativo y metodológico
        </p>
      </header>

      <section className="metricas">
        <article className="tarjeta">
          <span>
            {usuarioActual.rol === "Analista QA"
              ? "Mis HU"
              : "Total de HU"}
          </span>
          <strong>{totalHistorias}</strong>
        </article>

        <article className="tarjeta">
          <span>HU cerradas</span>
          <strong>{historiasCerradas}</strong>
        </article>

        <article className="tarjeta">
          <span>Riesgo alto</span>
          <strong>{historiasRiesgoAlto}</strong>
        </article>

        <article className="tarjeta">
          <span>Cumplimiento promedio</span>
          <strong>{cumplimientoPromedio}%</strong>
        </article>
      </section>

      <section className="panel">

        <div className="cabecera-panel">
          <div className="titulo-panel">
            <h2>Historias del sprint</h2>

            <p>
              Mostrando {historiasFiltradas.length} de{" "}
              {totalHistorias} historias
            </p>
          </div>

          <div className="acciones-hu">
            {puedeCrearHU && (
              <button
                type="button"
                className="boton-nueva-hu"
                onClick={abrirNuevaHistoria}
              >
                + Nueva HU
              </button>
            )}
          </div>
        </div>

        {mostrarFormulario && (
          <form
            className="formulario-hu"
            onSubmit={crearHistoria}
          >
            <div className="cabecera-formulario">
              <div>
                <h3>Nueva Historia de Usuario</h3>
                <p>
                  Registra una HU para incorporarla al seguimiento QA.
                </p>
              </div>

              <button
                type="button"
                className="boton-cerrar"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
            </div>

            <div className="campos-formulario">

              <label>
                Código HU *
                <input
                  name="id"
                  value={nuevaHistoria.id}
                  onChange={manejarCambioFormulario}
                  placeholder="HU-105"
                />
              </label>

              <label className="campo-amplio">
                Descripción *
                <input
                  name="titulo"
                  value={nuevaHistoria.titulo}
                  onChange={manejarCambioFormulario}
                  placeholder="Ej: Validación de pago de servicios"
                />
              </label>

              <label>
                Sprint
                <select
                  name="sprint"
                  value={nuevaHistoria.sprint}
                  onChange={manejarCambioFormulario}
                >
                  <option>Sprint 1</option>
                  <option>Sprint 2</option>
                  <option>Sprint 3</option>
                </select>
              </label>

              <label>
                Célula *
                <input
                  name="celula"
                  value={nuevaHistoria.celula}
                  onChange={manejarCambioFormulario}
                  placeholder="Ej: Pagos"
                />
              </label>

              <label>
                Prioridad
                <select
                  name="prioridad"
                  value={nuevaHistoria.prioridad}
                  onChange={manejarCambioFormulario}
                >
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Crítica</option>
                </select>
              </label>

              <label>
                Analista QA
                <select
                  name="analistaId"
                  value={nuevaHistoria.analistaId}
                  onChange={manejarCambioFormulario}
                >
                  {analistas.map((analista) => (
                    <option key={analista.id} value={analista.id}>
                      {analista.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                QE responsable
                <select
                  name="qeResponsableId"
                  value={nuevaHistoria.qeResponsableId}
                  onChange={manejarCambioFormulario}
                  disabled={usuarioActual.rol === "QE"}
                >
                  {qes.map((qe) => (
                    <option key={qe.id} value={qe.id}>
                      {qe.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Estado inicial
                <select
                  name="estado"
                  value={nuevaHistoria.estado}
                  onChange={manejarCambioFormulario}
                >
                  <option>Pendiente</option>
                  <option>Diseño de pruebas</option>
                  <option>En ejecución</option>
                </select>
              </label>

              <label>
                Riesgo
                <select
                  name="riesgo"
                  value={nuevaHistoria.riesgo}
                  onChange={manejarCambioFormulario}
                >
                  <option>Bajo</option>
                  <option>Medio</option>
                  <option>Alto</option>
                </select>
              </label>

            </div>

            {errorFormulario && (
              <p className="error-formulario">
                {errorFormulario}
              </p>
            )}

            <div className="acciones-formulario">
              <button
                type="button"
                className="boton-limpiar"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="boton-nueva-hu"
              >
                Crear HU
              </button>
            </div>
          </form>
        )}

        <div className="filtros filtros-separados">
          <label>
            Estado

            <select
              value={filtroEstado}
              onChange={(evento) =>
                setFiltroEstado(evento.target.value)
              }
            >
              <option value="Todos">
                Todos los estados
              </option>

              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </label>

          {usuarioActual.rol !== "Analista QA" && (
            <label>
              Analista QA

              <select
                value={filtroAnalista}
                onChange={(evento) =>
                  setFiltroAnalista(evento.target.value)
                }
              >
                <option value="Todos">
                  Todos los analistas
                </option>

                {analistasDisponibles.map((id) => (
                  <option key={id} value={id}>
                    {obtenerNombreUsuario(id)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="button"
            className="boton-limpiar"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>HU</th>
                <th>Descripción</th>
                <th>Célula</th>
                <th>Analista QA</th>
                <th>QE responsable</th>
                <th>Estado</th>
                <th>Cumplimiento</th>
                <th>Riesgo</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {historiasFiltradas.map((historia) => {
                const cumplimiento =
                  calcularCumplimiento(historia.entregables);

                return (
                  <tr key={historia.id}>
                    <td className="codigo">{historia.id}</td>

                    <td>{historia.titulo}</td>

                    <td>{historia.celula}</td>

                    <td>
                      {obtenerNombreUsuario(historia.analistaId)}
                    </td>

                    <td>
                      {obtenerNombreUsuario(
                        historia.qeResponsableId
                      )}
                    </td>

                    <td>
                      <span className="estado">
                        {historia.estado}
                      </span>
                    </td>

                    <td>
                      <div className="avance">
                        <div className="barra">
                          <div
                            className="barra-progreso"
                            style={{
                              width: `${cumplimiento}%`,
                            }}
                          />
                        </div>

                        <span>{cumplimiento}%</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`riesgo riesgo-${historia.riesgo.toLowerCase()}`}
                      >
                        {historia.riesgo}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="boton-detalle"
                        onClick={() =>
                          setHistoriaSeleccionadaId(historia.id)
                        }
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })}

              {historiasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="sin-resultados"
                  >
                    No existen historias que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {historiaSeleccionada && (
        <section
          ref={detalleRef}
          className="panel detalle-historia"
        >
          <div className="cabecera-detalle">
            <div>
              <p className="etiqueta-detalle">
                {historiaSeleccionada.id}
              </p>

              <h2>{historiaSeleccionada.titulo}</h2>

              <p>
                Cumplimiento de entregables requeridos para el
                seguimiento y cierre de pruebas.
              </p>
            </div>

            <button
              type="button"
              className="boton-cerrar"
              onClick={() => setHistoriaSeleccionadaId(null)}
            >
              Cerrar detalle
            </button>
          </div>

          <div className="resumen-detalle">
            <article>
              <span>Analista QA</span>
              <strong>
                {obtenerNombreUsuario(
                  historiaSeleccionada.analistaId
                )}
              </strong>
            </article>

            <article>
              <span>QE responsable</span>
              <strong>
                {obtenerNombreUsuario(
                  historiaSeleccionada.qeResponsableId
                )}
              </strong>
            </article>

            <article>
              <span>Célula</span>
              <strong>{historiaSeleccionada.celula}</strong>
            </article>

            <article>
              <span>Prioridad</span>
              <strong>
                {historiaSeleccionada.prioridad || "Sin definir"}
              </strong>
            </article>

            <article>
              <span>Estado actual</span>
              <strong>{historiaSeleccionada.estado}</strong>
            </article>

            <article>
              <span>Cumplimiento</span>
              <strong>
                {calcularCumplimiento(
                  historiaSeleccionada.entregables
                )}
                %
              </strong>
            </article>
          </div>

          <div className="bloqueo-detalle">
            <strong>Bloqueo o pendiente actual</strong>
            <p>{historiaSeleccionada.bloqueo}</p>
          </div>

          <div className="titulo-checklist">
            <h3>Checklist metodológico</h3>

            {usuarioActual.rol === "Analista QA" ? (
              <span className="permiso-edicion">
                Modo edición
              </span>
            ) : (
              <span className="permiso-consulta">
                Solo consulta
              </span>
            )}
          </div>

          <div className="lista-entregables">
            {Object.entries(historiaSeleccionada.entregables).map(
              ([clave, completado]) => (
                <div className="entregable" key={clave}>
                  <input
                    type="checkbox"
                    checked={completado}
                    disabled={usuarioActual.rol !== "Analista QA"}
                    onChange={(evento) =>
                      actualizarEntregable(
                        historiaSeleccionada.id,
                        clave,
                        evento.target.checked
                      )
                    }
                  />

                  <span>{nombresEntregables[clave]}</span>

                  <strong
                    className={
                      completado
                        ? "texto-completado"
                        : "texto-pendiente"
                    }
                  >
                    {completado ? "Completado" : "Pendiente"}
                  </strong>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;