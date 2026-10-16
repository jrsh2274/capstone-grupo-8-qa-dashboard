SET search_path TO quality360, public;

CREATE TABLE rol (
    id_rol INTEGER PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    descripcion VARCHAR(150),

    CONSTRAINT uq_rol_nombre UNIQUE (nombre)
);

CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL,
    fecha_creacion TIMESTAMP(6) NOT NULL,
    id_rol INTEGER NOT NULL,

    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES rol(id_rol)
        ON DELETE NO ACTION
);

CREATE TABLE supervision (
    id_supervision INTEGER PRIMARY KEY,
    fecha_desde DATE NOT NULL,
    fecha_hasta DATE,
    id_supervisor INTEGER NOT NULL,
    id_supervisado INTEGER NOT NULL,

    CONSTRAINT fk_supervision_supervisor
        FOREIGN KEY (id_supervisor)
        REFERENCES usuario(id_usuario)
        ON DELETE NO ACTION,

    CONSTRAINT fk_supervision_supervisado
        FOREIGN KEY (id_supervisado)
        REFERENCES usuario(id_usuario)
        ON DELETE NO ACTION,

    CONSTRAINT ck_supervision_usuarios_distintos
        CHECK (id_supervisor <> id_supervisado),

    CONSTRAINT ck_supervision_fechas
        CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde)
);

SET search_path TO quality360, public;

-- =====================================================
-- 4. CELULA
-- =====================================================

CREATE TABLE celula (
    id_celula INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(250),
    activo BOOLEAN NOT NULL,

    CONSTRAINT uq_celula_nombre
        UNIQUE (nombre)
);


-- =====================================================
-- 5. SPRINT
-- =====================================================

CREATE TABLE sprint (
    id_sprint INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    id_celula INTEGER NOT NULL,

    CONSTRAINT fk_sprint_celula
        FOREIGN KEY (id_celula)
        REFERENCES celula(id_celula)
        ON DELETE NO ACTION,

    CONSTRAINT ck_sprint_fechas
        CHECK (fecha_fin >= fecha_inicio)
);


-- =====================================================
-- 6. HISTORIA USUARIO
-- =====================================================

CREATE TABLE historia_usuario (
    id_historia INTEGER PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion VARCHAR(1000),
    estado VARCHAR(30) NOT NULL,
    prioridad VARCHAR(20),
    fecha_creacion TIMESTAMP(6) NOT NULL,
    id_celula INTEGER NOT NULL,

    CONSTRAINT uq_historia_usuario_codigo
        UNIQUE (codigo),

    CONSTRAINT fk_historia_usuario_celula
        FOREIGN KEY (id_celula)
        REFERENCES celula(id_celula)
        ON DELETE NO ACTION
);


-- =====================================================
-- 7. HISTORIA SPRINT
-- =====================================================

CREATE TABLE historia_sprint (
    id_historia_sprint INTEGER PRIMARY KEY,
    fecha_asignacion DATE NOT NULL,
    fecha_retiro DATE,
    id_historia INTEGER NOT NULL,
    id_sprint INTEGER NOT NULL,

    CONSTRAINT fk_historia_sprint_historia
        FOREIGN KEY (id_historia)
        REFERENCES historia_usuario(id_historia)
        ON DELETE NO ACTION,

    CONSTRAINT fk_historia_sprint_sprint
        FOREIGN KEY (id_sprint)
        REFERENCES sprint(id_sprint)
        ON DELETE NO ACTION,

    CONSTRAINT uq_historia_sprint
        UNIQUE (id_historia, id_sprint),

    CONSTRAINT ck_historia_sprint_fechas
        CHECK (
            fecha_retiro IS NULL
            OR fecha_retiro >= fecha_asignacion
        )
);


SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'quality360'
ORDER BY table_name;

--Reglas de negocio
--un solo ciclo activo por HU
--una sola asignación QA vigente por certificación
--una sola supervisión vigente por supervisado
--roles válidos controlados
--severidad de defectos controlada
--resultado de ejecución de pruebas controlado



CREATE TABLE quality360.celula (
    id_celula INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(250),
    activo BOOLEAN NOT NULL,

    CONSTRAINT uq_celula_nombre
        UNIQUE (nombre)
);

CREATE TABLE quality360.sprint (
    id_sprint INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    id_celula INTEGER NOT NULL,

    CONSTRAINT fk_sprint_celula
        FOREIGN KEY (id_celula)
        REFERENCES quality360.celula(id_celula)
        ON DELETE NO ACTION,

    CONSTRAINT ck_sprint_fechas
        CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE quality360.historia_usuario (
    id_historia INTEGER PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion VARCHAR(1000),
    estado VARCHAR(30) NOT NULL,
    prioridad VARCHAR(20),
    fecha_creacion TIMESTAMP(6) NOT NULL,
    id_celula INTEGER NOT NULL,

    CONSTRAINT uq_historia_usuario_codigo
        UNIQUE (codigo),

    CONSTRAINT fk_historia_usuario_celula
        FOREIGN KEY (id_celula)
        REFERENCES quality360.celula(id_celula)
        ON DELETE NO ACTION
);

CREATE TABLE quality360.historia_sprint (
    id_historia_sprint INTEGER PRIMARY KEY,
    fecha_asignacion DATE NOT NULL,
    fecha_retiro DATE,
    id_historia INTEGER NOT NULL,
    id_sprint INTEGER NOT NULL,

    CONSTRAINT fk_historia_sprint_historia
        FOREIGN KEY (id_historia)
        REFERENCES quality360.historia_usuario(id_historia)
        ON DELETE NO ACTION,

    CONSTRAINT fk_historia_sprint_sprint
        FOREIGN KEY (id_sprint)
        REFERENCES quality360.sprint(id_sprint)
        ON DELETE NO ACTION,

    CONSTRAINT uq_historia_sprint
        UNIQUE (id_historia, id_sprint),

    CONSTRAINT ck_historia_sprint_fechas
        CHECK (
            fecha_retiro IS NULL
            OR fecha_retiro >= fecha_asignacion
        )
);

CREATE TABLE quality360.certificacion (
    id_certificacion INTEGER PRIMARY KEY,
    numero_ciclo INTEGER NOT NULL,
    estado VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL,
    fecha_inicio TIMESTAMP(6) NOT NULL,
    fecha_fin TIMESTAMP(6),
    observacion VARCHAR(500),
    id_historia INTEGER NOT NULL,

    CONSTRAINT fk_certificacion_historia
        FOREIGN KEY (id_historia)
        REFERENCES quality360.historia_usuario(id_historia)
        ON DELETE NO ACTION,

    CONSTRAINT uq_certificacion_ciclo
        UNIQUE (id_historia, numero_ciclo),

    CONSTRAINT ck_certificacion_fechas
        CHECK (
            fecha_fin IS NULL
            OR fecha_fin >= fecha_inicio
        )
);

CREATE TABLE quality360.asignacion_certificacion (
    id_asignacion INTEGER PRIMARY KEY,
    fecha_desde TIMESTAMP(6) NOT NULL,
    fecha_hasta TIMESTAMP(6),
    id_certificacion INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,

    CONSTRAINT fk_asignacion_certificacion
        FOREIGN KEY (id_certificacion)
        REFERENCES quality360.certificacion(id_certificacion)
        ON DELETE NO ACTION,

    CONSTRAINT fk_asignacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES quality360.usuario(id_usuario)
        ON DELETE NO ACTION,

    CONSTRAINT ck_asignacion_fechas
        CHECK (
            fecha_hasta IS NULL
            OR fecha_hasta >= fecha_desde
        )
);

CREATE TABLE quality360.item_checklist (
    id_item_checklist INTEGER PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    obligatorio BOOLEAN NOT NULL,
    orden INTEGER NOT NULL,
    activo BOOLEAN NOT NULL,
    id_certificacion INTEGER NOT NULL,

    CONSTRAINT fk_item_checklist_certificacion
        FOREIGN KEY (id_certificacion)
        REFERENCES quality360.certificacion(id_certificacion)
        ON DELETE NO ACTION
);

CREATE TABLE quality360.entregable (
    id_entregable INTEGER PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    estado VARCHAR(30) NOT NULL,
    fecha_creacion TIMESTAMP(6) NOT NULL,
    fecha_validacion TIMESTAMP(6),
    id_certificacion INTEGER NOT NULL,

    CONSTRAINT fk_entregable_certificacion
        FOREIGN KEY (id_certificacion)
        REFERENCES quality360.certificacion(id_certificacion)
        ON DELETE NO ACTION,

    CONSTRAINT ck_entregable_fechas
        CHECK (
            fecha_validacion IS NULL
            OR fecha_validacion >= fecha_creacion
        )
);

CREATE TABLE quality360.evidencia (
    id_evidencia INTEGER PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    tipo VARCHAR(30) NOT NULL,
    referencia VARCHAR(500) NOT NULL,
    fecha_carga TIMESTAMP(6) NOT NULL,
    id_entregable INTEGER NOT NULL,

    CONSTRAINT fk_evidencia_entregable
        FOREIGN KEY (id_entregable)
        REFERENCES quality360.entregable(id_entregable)
        ON DELETE NO ACTION
);

CREATE TABLE quality360.ejecucion_prueba (
    id_ejecucion INTEGER PRIMARY KEY,
    nombre_prueba VARCHAR(200) NOT NULL,
    resultado VARCHAR(30) NOT NULL,
    fecha_ejecucion TIMESTAMP(6) NOT NULL,
    ambiente VARCHAR(50),
    observacion VARCHAR(500),
    id_certificacion INTEGER NOT NULL,

    CONSTRAINT fk_ejecucion_certificacion
        FOREIGN KEY (id_certificacion)
        REFERENCES quality360.certificacion(id_certificacion)
        ON DELETE NO ACTION
);

CREATE TABLE quality360.defecto (
    id_defecto INTEGER PRIMARY KEY,
    codigo VARCHAR(50),
    titulo VARCHAR(200) NOT NULL,
    descripcion VARCHAR(1000),
    severidad VARCHAR(20) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    fecha_reporte TIMESTAMP(6) NOT NULL,
    fecha_cierre TIMESTAMP(6),
    id_certificacion INTEGER NOT NULL,

    CONSTRAINT fk_defecto_certificacion
        FOREIGN KEY (id_certificacion)
        REFERENCES quality360.certificacion(id_certificacion)
        ON DELETE NO ACTION,

    CONSTRAINT ck_defecto_fechas
        CHECK (
            fecha_cierre IS NULL
            OR fecha_cierre >= fecha_reporte
        )
);

CREATE TABLE quality360.impedimento (
    id_impedimento INTEGER PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion VARCHAR(1000),
    tipo VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    fecha_registro TIMESTAMP(6) NOT NULL,
    fecha_resolucion TIMESTAMP(6),
    id_certificacion INTEGER NOT NULL,

    CONSTRAINT fk_impedimento_certificacion
        FOREIGN KEY (id_certificacion)
        REFERENCES quality360.certificacion(id_certificacion)
        ON DELETE NO ACTION,

    CONSTRAINT ck_impedimento_fechas
        CHECK (
            fecha_resolucion IS NULL
            OR fecha_resolucion >= fecha_registro
        )
);

CREATE TABLE quality360.accion_impedimento (
    id_accion_impedimento INTEGER PRIMARY KEY,
    descripcion VARCHAR(1000) NOT NULL,
    fecha_accion TIMESTAMP(6) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    observacion VARCHAR(500),
    id_impedimento INTEGER NOT NULL,

    CONSTRAINT fk_accion_impedimento
        FOREIGN KEY (id_impedimento)
        REFERENCES quality360.impedimento(id_impedimento)
        ON DELETE NO ACTION
);


--Índice único parcial para certificación activa
CREATE UNIQUE INDEX uq_certificacion_historia_activa
ON quality360.certificacion (id_historia)
WHERE activo = TRUE;

--Cada Certificacion puede tener muchas asignaciones QA en el tiempo, pero solo una asignación vigente.
CREATE UNIQUE INDEX uq_asignacion_certificacion_vigente
ON quality360.asignacion_certificacion (id_certificacion)
WHERE fecha_hasta IS NULL;

--Un usuario supervisado puede tener historial de distintos supervisores, pero solo una supervisión vigente a la vez
CREATE UNIQUE INDEX uq_supervision_supervisado_vigente
ON quality360.supervision (id_supervisado)
WHERE fecha_hasta IS NULL;

--LIDER_QA, QE,QA
ALTER TABLE quality360.rol
ADD CONSTRAINT ck_rol_nombre
CHECK (nombre IN ('LIDER_QA', 'QE', 'QA'));

--Severidad defecto
ALTER TABLE quality360.defecto
ADD CONSTRAINT ck_defecto_severidad
CHECK (severidad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA'));

--resultado ejecucion QA
ALTER TABLE quality360.ejecucion_prueba
ADD CONSTRAINT ck_ejecucion_prueba_resultado
CHECK (
    resultado IN (
        'EXITOSA',
        'FALLIDA',
        'BLOQUEADA',
        'NO_EJECUTADA'
    )
);

-- prueba Insert roles maestros
INSERT INTO quality360.rol (id_rol, nombre, descripcion)
VALUES
    (1, 'LIDER_QA', 'Jefatura de Quality Engineers y visión global'),
    (2, 'QE', 'Quality Engineer responsable de supervisión y seguimiento QA'),
    (3, 'QA', 'Analista QA responsable de ejecución de certificaciones');

SELECT *
FROM quality360.rol
ORDER BY id_rol;

-----
INSERT INTO quality360.usuario
    (id_usuario, nombre, email, activo, fecha_creacion, id_rol)
VALUES
    (1, 'Lider QA Demo', 'lider.qa@quality360.cl', TRUE, CURRENT_TIMESTAMP, 1),
    (2, 'QE Demo', 'qe.demo@quality360.cl', TRUE, CURRENT_TIMESTAMP, 2),
    (3, 'QA Demo', 'qa.demo@quality360.cl', TRUE, CURRENT_TIMESTAMP, 3);


SELECT
    u.id_usuario,
    u.nombre,
    u.email,
    r.nombre AS rol,
    u.activo
FROM quality360.usuario u
JOIN quality360.rol r
    ON r.id_rol = u.id_rol
ORDER BY u.id_usuario;

----------supervision
INSERT INTO quality360.supervision
    (id_supervision, fecha_desde, fecha_hasta, id_supervisor, id_supervisado)
VALUES
    (1, CURRENT_DATE, NULL, 1, 2),
    (2, CURRENT_DATE, NULL, 2, 3);

SELECT
    s.id_supervision,
    sup.nombre AS supervisor,
    r_sup.nombre AS rol_supervisor,
    sub.nombre AS supervisado,
    r_sub.nombre AS rol_supervisado,
    s.fecha_desde,
    s.fecha_hasta
FROM quality360.supervision s
JOIN quality360.usuario sup
    ON sup.id_usuario = s.id_supervisor
JOIN quality360.rol r_sup
    ON r_sup.id_rol = sup.id_rol
JOIN quality360.usuario sub
    ON sub.id_usuario = s.id_supervisado
JOIN quality360.rol r_sub
    ON r_sub.id_rol = sub.id_rol
ORDER BY s.id_supervision;

--prueba duplicate key
INSERT INTO quality360.supervision
    (id_supervision, fecha_desde, fecha_hasta, id_supervisor, id_supervisado)
VALUES
    (3, CURRENT_DATE, NULL, 1, 3);


SELECT
    id_supervision,
    id_supervisor,
    id_supervisado,
    fecha_desde,
    fecha_hasta
FROM quality360.supervision
ORDER BY id_supervision;



