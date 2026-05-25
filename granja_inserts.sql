-- ===========================================================================
-- SCRIPT DE POBLACIÓN DE DATOS DE PRUEBA - GRANJA CERDOS
-- Generado para: La Voluntad de Dios
-- Fecha: 2026-05-25
-- ===========================================================================

BEGIN;

-- 1. ADMINISTRADORES (Ya existe 1, agregamos 19 más)
INSERT INTO personal.administrador (p_nombre, s_nombre, p_apellido, s_apellido, correo_admin, contrasena_admin) VALUES
('Alejandro', 'Jose', 'Rodriguez', 'Sosa', 'alejandro.rodriguez@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Beatriz', 'Elena', 'Martinez', 'Ruiz', 'beatriz.martinez@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Carlos', 'Alberto', 'Gomez', 'Perez', 'carlos.gomez@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Diana', 'Patricia', 'Lopez', 'Garcia', 'diana.lopez@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Eduardo', 'Luis', 'Hernandez', 'Torres', 'eduardo.hernandez@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Fernanda', 'Maria', 'Diaz', 'Morales', 'fernanda.diaz@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Gabriel', 'Antonio', 'Castro', 'Vargas', 'gabriel.castro@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Helena', 'Isabel', 'Reyes', 'Jimenez', 'helena.reyes@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Ivan', 'Ramiro', 'Mendoza', 'Salazar', 'ivan.mendoza@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Julia', 'Andrea', 'Cardona', 'Osorio', 'julia.cardona@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Kevin', 'Andres', 'Quintero', 'Rios', 'kevin.quintero@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Laura', 'Sofia', 'Villada', 'Henao', 'laura.villada@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Mario', 'Augusto', 'Pineda', 'Giraldo', 'mario.pineda@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Natalia', 'Lucia', 'Ramos', 'Cano', 'natalia.ramos@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Oscar', 'Dario', 'Suarez', 'Franco', 'oscar.suarez@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Paula', 'Ximena', 'Ortega', 'Mejia', 'paula.ortega@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Ricardo', 'Alfonso', 'Valencia', 'Londoño', 'ricardo.valencia@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Sandra', 'Milena', 'Restrepo', 'Zapata', 'sandra.restrepo@granja.com', crypt('admin123', gen_salt('bf', 12))),
('Tomas', 'Enrique', 'Bermudez', 'Velez', 'tomas.bermudez@granja.com', crypt('admin123', gen_salt('bf', 12)));

-- 2. COCHINERAS (Ya existen 3, agregamos 17 más)
INSERT INTO infraestructura.cochinera (capacidad_max, estado_cochinera) VALUES
(15, 'Disponible'), (20, 'Disponible'), (12, 'Disponible'), (18, 'Disponible'), (10, 'Disponible'),
(15, 'Disponible'), (20, 'Disponible'), (12, 'Disponible'), (18, 'Disponible'), (10, 'Disponible'),
(15, 'Disponible'), (20, 'Disponible'), (12, 'Disponible'), (18, 'Disponible'), (10, 'Disponible'),
(25, 'Disponible'), (30, 'Disponible');

-- 3. EMPLEADOS (Ya existen 2, agregamos 18 más)
INSERT INTO personal.empleado (p_nombre, p_apellido, cedula_empleado, estado_empleado, id_admin) VALUES
('Roberto', 'Cano', '1003', 'Activo', 1),
('Marta', 'Soto', '1004', 'Activo', 1),
('Luis', 'Peralta', '1005', 'Activo', 1),
('Jorge', 'Mesa', '1006', 'Activo', 1),
('Sofia', 'Duque', '1007', 'Activo', 1),
('Andres', 'Marin', '1008', 'Activo', 1),
('Elena', 'Vivas', '1009', 'Activo', 1),
('Felipe', 'Lara', '1010', 'Activo', 1),
('Gloria', 'Pons', '1011', 'Activo', 1),
('Hugo', 'Silva', '1012', 'Activo', 1),
('Irene', 'Melo', '1013', 'Activo', 1),
('Javier', 'Luna', '1014', 'Activo', 1),
('Karla', 'Mora', '1015', 'Activo', 1),
('Leonel', 'Caro', '1016', 'Activo', 1),
('Monica', 'Roso', '1017', 'Activo', 1),
('Nelson', 'Polo', '1018', 'Activo', 1),
('Olga', 'Ruiz', '1019', 'Activo', 1),
('Pedro', 'Saez', '1020', 'Activo', 1);

-- 4. CERDOS (60 registros)
-- IMPORTANTE: TODOS los cerdos se insertan inicialmente como 'Activo' 
-- para cumplir con las restricciones de los triggers de traslado.
INSERT INTO infraestructura.cerdo (sexo_cerdo, id_raza, fecha_nacimiento, estado_cerdo) VALUES
-- Cerdos destinados a permanecer Activos (1-20)
('Macho', 1, '2025-01-10', 'Activo'), ('Hembra', 1, '2025-01-15', 'Activo'),
('Macho', 2, '2025-02-01', 'Activo'), ('Hembra', 2, '2025-02-05', 'Activo'),
('Macho', 3, '2025-03-12', 'Activo'), ('Hembra', 3, '2025-03-20', 'Activo'),
('Macho', 1, '2025-04-01', 'Activo'), ('Hembra', 2, '2025-04-10', 'Activo'),
('Macho', 3, '2025-05-05', 'Activo'), ('Hembra', 1, '2025-05-15', 'Activo'),
('Macho', 2, '2025-06-01', 'Activo'), ('Hembra', 3, '2025-06-10', 'Activo'),
('Macho', 1, '2025-07-05', 'Activo'), ('Hembra', 2, '2025-07-20', 'Activo'),
('Macho', 3, '2025-08-01', 'Activo'), ('Hembra', 1, '2025-08-15', 'Activo'),
('Macho', 2, '2025-09-05', 'Activo'), ('Hembra', 3, '2025-09-20', 'Activo'),
('Macho', 1, '2025-10-01', 'Activo'), ('Hembra', 2, '2025-10-10', 'Activo'),
-- Cerdos destinados a Ventas (21-40)
('Macho', 1, '2024-05-10', 'Activo'), ('Hembra', 2, '2024-05-15', 'Activo'),
('Macho', 3, '2024-06-01', 'Activo'), ('Hembra', 1, '2024-06-05', 'Activo'),
('Macho', 2, '2024-07-12', 'Activo'), ('Hembra', 3, '2024-07-20', 'Activo'),
('Macho', 1, '2024-08-01', 'Activo'), ('Hembra', 2, '2024-08-10', 'Activo'),
('Macho', 3, '2024-09-05', 'Activo'), ('Hembra', 1, '2024-09-15', 'Activo'),
('Macho', 2, '2024-10-01', 'Activo'), ('Hembra', 3, '2024-10-10', 'Activo'),
('Macho', 1, '2024-11-05', 'Activo'), ('Hembra', 2, '2024-11-20', 'Activo'),
('Macho', 3, '2024-12-01', 'Activo'), ('Hembra', 1, '2024-12-15', 'Activo'),
('Macho', 2, '2025-01-05', 'Activo'), ('Hembra', 3, '2025-01-20', 'Activo'),
('Macho', 1, '2025-02-01', 'Activo'), ('Hembra', 2, '2025-02-10', 'Activo'),
-- Cerdos destinados a Mortalidad (41-60)
('Macho', 1, '2024-10-10', 'Activo'), ('Hembra', 2, '2024-10-15', 'Activo'),
('Macho', 3, '2024-11-01', 'Activo'), ('Hembra', 1, '2024-11-05', 'Activo'),
('Macho', 2, '2024-12-12', 'Activo'), ('Hembra', 3, '2024-12-20', 'Activo'),
('Macho', 1, '2025-01-01', 'Activo'), ('Hembra', 2, '2025-01-10', 'Activo'),
('Macho', 3, '2025-02-05', 'Activo'), ('Hembra', 1, '2025-02-15', 'Activo'),
('Macho', 2, '2025-03-01', 'Activo'), ('Hembra', 3, '2025-03-10', 'Activo'),
('Macho', 1, '2025-04-05', 'Activo'), ('Hembra', 2, '2025-04-20', 'Activo'),
('Macho', 3, '2025-05-01', 'Activo'), ('Hembra', 1, '2025-05-15', 'Activo'),
('Macho', 2, '2025-06-05', 'Activo'), ('Hembra', 3, '2025-06-20', 'Activo'),
('Macho', 1, '2025-07-01', 'Activo'), ('Hembra', 2, '2025-07-10', 'Activo');

-- 5. HISTORIAL DE TRASLADO 
-- Asignación inicial a cochineras para TODOS los 60 cerdos respetando la capacidad_max.
-- C1(cap:15)->1-15, C2(cap:20)->16-35, C3(cap:12)->36-47, C4(cap:18)->48-60.
INSERT INTO infraestructura.historial_traslado (id_cerdo, id_cochinera_origen, id_cochinera_destino, fecha_traslado, motivo) VALUES
(1, NULL, 1, '2025-01-10', 'Ingreso nacimiento'), (2, NULL, 1, '2025-01-15', 'Ingreso nacimiento'),
(3, NULL, 1, '2025-02-01', 'Ingreso nacimiento'), (4, NULL, 1, '2025-02-05', 'Ingreso nacimiento'),
(5, NULL, 1, '2025-03-12', 'Ingreso nacimiento'), (6, NULL, 1, '2025-03-20', 'Ingreso nacimiento'),
(7, NULL, 1, '2025-04-01', 'Ingreso nacimiento'), (8, NULL, 1, '2025-04-10', 'Ingreso nacimiento'),
(9, NULL, 1, '2025-05-05', 'Ingreso nacimiento'), (10, NULL, 1, '2025-05-15', 'Ingreso nacimiento'),
(11, NULL, 1, '2025-06-01', 'Ingreso nacimiento'), (12, NULL, 1, '2025-06-10', 'Ingreso nacimiento'),
(13, NULL, 1, '2025-07-05', 'Ingreso nacimiento'), (14, NULL, 1, '2025-07-20', 'Ingreso nacimiento'),
(15, NULL, 1, '2025-08-01', 'Ingreso nacimiento'),
(16, NULL, 2, '2025-08-15', 'Ingreso nacimiento'), (17, NULL, 2, '2025-09-05', 'Ingreso nacimiento'),
(18, NULL, 2, '2025-09-20', 'Ingreso nacimiento'), (19, NULL, 2, '2025-10-01', 'Ingreso nacimiento'),
(20, NULL, 2, '2025-10-10', 'Ingreso nacimiento'), (21, NULL, 2, '2024-05-10', 'Ingreso nacimiento'),
(22, NULL, 2, '2024-05-15', 'Ingreso nacimiento'), (23, NULL, 2, '2024-06-01', 'Ingreso nacimiento'),
(24, NULL, 2, '2024-06-05', 'Ingreso nacimiento'), (25, NULL, 2, '2024-07-12', 'Ingreso nacimiento'),
(26, NULL, 2, '2024-07-20', 'Ingreso nacimiento'), (27, NULL, 2, '2024-08-01', 'Ingreso nacimiento'),
(28, NULL, 2, '2024-08-10', 'Ingreso nacimiento'), (29, NULL, 2, '2024-09-05', 'Ingreso nacimiento'),
(30, NULL, 2, '2024-09-15', 'Ingreso nacimiento'), (31, NULL, 2, '2024-10-01', 'Ingreso nacimiento'),
(32, NULL, 2, '2024-10-10', 'Ingreso nacimiento'), (33, NULL, 2, '2024-11-05', 'Ingreso nacimiento'),
(34, NULL, 2, '2024-11-20', 'Ingreso nacimiento'), (35, NULL, 2, '2024-12-01', 'Ingreso nacimiento'),
(36, NULL, 3, '2024-12-15', 'Ingreso nacimiento'), (37, NULL, 3, '2025-01-05', 'Ingreso nacimiento'),
(38, NULL, 3, '2025-01-20', 'Ingreso nacimiento'), (39, NULL, 3, '2025-02-01', 'Ingreso nacimiento'),
(40, NULL, 3, '2025-02-10', 'Ingreso nacimiento'), (41, NULL, 3, '2024-10-10', 'Ingreso nacimiento'),
(42, NULL, 3, '2024-10-15', 'Ingreso nacimiento'), (43, NULL, 3, '2024-11-01', 'Ingreso nacimiento'),
(44, NULL, 3, '2024-11-05', 'Ingreso nacimiento'), (45, NULL, 3, '2024-12-12', 'Ingreso nacimiento'),
(46, NULL, 3, '2024-12-20', 'Ingreso nacimiento'), (47, NULL, 3, '2025-01-01', 'Ingreso nacimiento'),
(48, NULL, 4, '2025-01-10', 'Ingreso nacimiento'), (49, NULL, 4, '2025-02-05', 'Ingreso nacimiento'),
(50, NULL, 4, '2025-02-15', 'Ingreso nacimiento'), (51, NULL, 4, '2025-03-01', 'Ingreso nacimiento'),
(52, NULL, 4, '2025-03-10', 'Ingreso nacimiento'), (53, NULL, 4, '2025-04-05', 'Ingreso nacimiento'),
(54, NULL, 4, '2025-04-20', 'Ingreso nacimiento'), (55, NULL, 4, '2025-05-01', 'Ingreso nacimiento'),
(56, NULL, 4, '2025-05-15', 'Ingreso nacimiento'), (57, NULL, 4, '2025-06-05', 'Ingreso nacimiento'),
(58, NULL, 4, '2025-06-20', 'Ingreso nacimiento'), (59, NULL, 4, '2025-07-01', 'Ingreso nacimiento'),
(60, NULL, 4, '2025-07-10', 'Ingreso nacimiento');

-- 6. INVENTARIO 
INSERT INTO gestion.inventario (nombre_item, id_tipo_item, cantidad_stock, id_unidad_base, estado_item) VALUES
('Maíz Molido', 1, 1000.00, 1, 'Disponible'), ('Soya Solvente', 1, 800.00, 1, 'Disponible'),
('Suero de leche', 3, 200.00, 3, 'Disponible'), ('Complejo B', 2, 30.00, 4, 'Disponible'),
('Hierro inyectable', 2, 45.00, 4, 'Disponible'), ('Purina Inicio', 1, 600.00, 1, 'Disponible'),
('Purina Engorde', 1, 1200.00, 1, 'Disponible'), ('Desparasitante', 2, 100.00, 2, 'Disponible'),
('Vitamina C', 3, 50.00, 1, 'Disponible'), ('Sal Mineralizada', 3, 150.00, 1, 'Disponible'),
('Melaza', 3, 90.00, 3, 'Disponible'), ('Pasta cicatrizante', 2, 20.00, 2, 'Disponible'),
('Yodo', 2, 15.00, 3, 'Disponible'), ('Vacuna Cólera', 2, 50.00, 4, 'Disponible'),
('Harina de pescado', 1, 300.00, 1, 'Disponible'), ('Carbonato de Calcio', 3, 250.00, 1, 'Disponible'),
('Aceite vegetal', 3, 40.00, 3, 'Disponible'), ('Proteína concentrada', 1, 400.00, 1, 'Disponible');

-- 7. PESAJE 
INSERT INTO gestion.pesaje (id_cerdo, id_empleado, fecha_pesaje, peso_kg, observaciones) VALUES
(1, 1, '2025-01-10', 1.50, 'Peso al nacer'), (2, 1, '2025-01-15', 1.40, 'Peso al nacer'),
(1, 2, '2025-02-10', 15.00, 'Control mes 1'), (2, 2, '2025-02-15', 14.50, 'Control mes 1'),
(3, 3, '2025-03-01', 1.60, 'Peso al nacer'), (4, 3, '2025-03-05', 1.55, 'Peso al nacer'),
(21, 1, '2024-05-10', 1.45, 'Peso al nacer'), (21, 2, '2024-11-10', 110.00, 'Peso pre-venta'),
(22, 1, '2024-05-15', 1.35, 'Peso al nacer'), (22, 2, '2024-11-15', 105.00, 'Peso pre-venta'),
(23, 3, '2024-06-01', 1.50, 'Peso al nacer'), (23, 4, '2024-12-01', 115.00, 'Peso pre-venta'),
(24, 3, '2024-06-05', 1.40, 'Peso al nacer'), (24, 4, '2024-12-05', 108.00, 'Peso pre-venta'),
(25, 5, '2025-01-12', 112.00, 'Peso pre-venta'), (26, 6, '2025-01-20', 109.00, 'Peso pre-venta'),
(27, 7, '2025-02-01', 114.00, 'Peso pre-venta'), (28, 8, '2025-02-10', 111.00, 'Peso pre-venta'),
(29, 9, '2025-03-05', 116.00, 'Peso pre-venta'), (30, 10, '2025-03-15', 107.00, 'Peso pre-venta');

-- 8. REGISTROS (Alimentación y Revisión Médica)
-- Alimentación (Categoría 1)
INSERT INTO gestion.registro (id_cerdo, id_empleado, id_categoria, fecha_registro, observaciones) VALUES
(1, 1, 1, '2025-05-01 08:00:00', 'Alimentación matutina'), (2, 1, 1, '2025-05-01 08:05:00', 'Alimentación matutina'),
(3, 2, 1, '2025-05-01 08:10:00', 'Alimentación matutina'), (4, 2, 1, '2025-05-01 08:15:00', 'Alimentación matutina'),
(5, 3, 1, '2025-05-02 08:00:00', 'Alimentación matutina'), (6, 3, 1, '2025-05-02 08:05:00', 'Alimentación matutina'),
(7, 4, 1, '2025-05-02 08:10:00', 'Alimentación matutina'), (8, 4, 1, '2025-05-02 08:15:00', 'Alimentación matutina'),
(9, 5, 1, '2025-05-03 08:00:00', 'Alimentación matutina'), (10, 5, 1, '2025-05-03 08:05:00', 'Alimentación matutina'),
(11, 6, 1, '2025-05-03 08:10:00', 'Alimentación matutina'), (12, 6, 1, '2025-05-03 08:15:00', 'Alimentación matutina'),
(13, 7, 1, '2025-05-04 08:00:00', 'Alimentación matutina'), (14, 7, 1, '2025-05-04 08:05:00', 'Alimentación matutina'),
(15, 8, 1, '2025-05-04 08:10:00', 'Alimentación matutina'), (16, 8, 1, '2025-05-04 08:15:00', 'Alimentación matutina'),
(17, 9, 1, '2025-05-05 08:00:00', 'Alimentación matutina'), (18, 9, 1, '2025-05-05 08:05:00', 'Alimentación matutina'),
(19, 10, 1, '2025-05-05 08:10:00', 'Alimentación matutina'), (20, 10, 1, '2025-05-05 08:15:00', 'Alimentación matutina');

-- Revisión Médica (Categoría 2)
INSERT INTO gestion.registro (id_cerdo, id_empleado, id_categoria, fecha_registro, observaciones) VALUES
(1, 2, 2, '2025-05-10 10:00:00', 'Chequeo rutinario'), (2, 2, 2, '2025-05-10 10:15:00', 'Chequeo rutinario'),
(3, 3, 2, '2025-05-11 10:00:00', 'Control de crecimiento'), (4, 3, 2, '2025-05-11 10:15:00', 'Control de crecimiento'),
(5, 4, 2, '2025-05-12 10:00:00', 'Revisión por cojera'), (6, 4, 2, '2025-05-12 10:15:00', 'Revisión por cojera'),
(7, 5, 2, '2025-05-13 10:00:00', 'Vacunación'), (8, 5, 2, '2025-05-13 10:15:00', 'Vacunación'),
(9, 6, 2, '2025-05-14 10:00:00', 'Desparasitación'), (10, 6, 2, '2025-05-14 10:15:00', 'Desparasitación'),
(11, 7, 2, '2025-05-15 10:00:00', 'Chequeo rutinario'), (12, 7, 2, '2025-05-15 10:15:00', 'Chequeo rutinario'),
(13, 8, 2, '2025-05-16 10:00:00', 'Revisión piel'), (14, 8, 2, '2025-05-16 10:15:00', 'Revisión piel'),
(15, 9, 2, '2025-05-17 10:00:00', 'Control de peso bajo'), (16, 9, 2, '2025-05-17 10:15:00', 'Control de peso bajo'),
(17, 10, 2, '2025-05-18 10:00:00', 'Chequeo post-vacuna'), (18, 10, 2, '2025-05-18 10:15:00', 'Chequeo post-vacuna'),
(19, 11, 2, '2025-05-19 10:00:00', 'Revisión ojos'), (20, 11, 2, '2025-05-19 10:15:00', 'Revisión ojos');

-- Alimentación Detalle
INSERT INTO gestion.alimentacion (id_registro, id_categoria, id_item, cantidad_consumida, id_unidad) VALUES
(1, 1, 3, 2.50, 1), (2, 1, 3, 2.50, 1), (3, 1, 3, 2.60, 1), (4, 1, 3, 2.60, 1),
(5, 1, 8, 3.00, 1), (6, 1, 8, 3.00, 1), (7, 1, 8, 3.10, 1), (8, 1, 8, 3.10, 1),
(9, 1, 9, 2.80, 1), (10, 1, 9, 2.80, 1), (11, 1, 9, 2.90, 1), (12, 1, 9, 2.90, 1),
(13, 1, 3, 2.70, 1), (14, 1, 3, 2.70, 1), (15, 1, 3, 2.80, 1), (16, 1, 3, 2.80, 1),
(17, 1, 8, 3.20, 1), (18, 1, 8, 3.20, 1), (19, 1, 8, 3.30, 1), (20, 1, 8, 3.30, 1);

-- Revisión Médica Detalle
INSERT INTO gestion.revision_medica (id_registro, id_categoria, diagnostico, id_medicamento_aplicado) VALUES
(21, 2, 'Sano', NULL), (22, 2, 'Sano', NULL),
(23, 2, 'Crecimiento normal', NULL), (24, 2, 'Crecimiento normal', NULL),
(25, 2, 'Leve cojera pata trasera izquierda', 4), (26, 2, 'Leve cojera pata trasera derecha', 4),
(27, 2, 'Refuerzo de vacunas', 16), (28, 2, 'Refuerzo de vacunas', 16),
(29, 2, 'Presencia leve de parásitos', 10), (30, 2, 'Presencia leve de parásitos', 10),
(31, 2, 'Sano', NULL), (32, 2, 'Sano', NULL),
(33, 2, 'Irritación cutánea leve', 14), (34, 2, 'Irritación cutánea leve', 14),
(35, 2, 'Bajo peso, se recomienda suplemento', 6), (36, 2, 'Bajo peso, se recomienda suplemento', 6),
(37, 2, 'Post-vacunación normal', NULL), (38, 2, 'Post-vacunación normal', NULL),
(39, 2, 'Conjuntivitis leve', 15), (40, 2, 'Conjuntivitis leve', 15);

-- 9. CLIENTES 
INSERT INTO comercial.cliente (p_nombre, p_apellido, cedula_cliente, telefono, correo_cliente, estado_cliente) VALUES
('Ricardo', 'Torres', '2003', '3001112233', 'ricardo@cliente.com', 'Activo'),
('Juliana', 'Mora', '2004', '3004445566', 'juliana@cliente.com', 'Activo'),
('Marcos', 'Paz', '2005', '3007778899', 'marcos@cliente.com', 'Activo'),
('Estela', 'Rios', '2006', '3101112233', 'estela@cliente.com', 'Activo'),
('Fabian', 'Solis', '2007', '3104445566', 'fabian@cliente.com', 'Activo'),
('Jimena', 'Luna', '2008', '3107778899', 'jimena@cliente.com', 'Activo'),
('Dario', 'Cruz', '2009', '3201112233', 'dario@cliente.com', 'Activo'),
('Gloria', 'Vega', '2010', '3204445566', 'gloria@cliente.com', 'Activo'),
('Hector', 'Cano', '2011', '3207778899', 'hector@cliente.com', 'Activo'),
('Ines', 'Gil', '2012', '3111112233', 'ines@cliente.com', 'Activo'),
('Jose', 'Rey', '2013', '3114445566', 'jose@cliente.com', 'Activo'),
('Luz', 'Bello', '2014', '3117778899', 'luz@cliente.com', 'Activo'),
('Manuel', 'Caro', '2015', '3121112233', 'manuel@cliente.com', 'Activo'),
('Nora', 'Vidal', '2016', '3124445566', 'nora@cliente.com', 'Activo'),
('Pablo', 'Sanz', '2017', '3127778899', 'pablo@cliente.com', 'Activo'),
('Rosa', 'Toro', '2018', '3131112233', 'rosa@cliente.com', 'Activo'),
('Silvia', 'Maya', '2019', '3134445566', 'silvia@cliente.com', 'Activo'),
('Urbano', 'Polo', '2020', '3137778899', 'urbano@cliente.com', 'Activo');

-- 10. FACTURAS (Para cerdos 21-40, que en este punto son 'Activo')
INSERT INTO comercial.factura (id_cliente, id_empleado, fecha_venta, estado_factura) VALUES
(1, 1, '2024-11-15', 'Completada'), (2, 2, '2024-11-20', 'Completada'),
(3, 3, '2024-12-05', 'Completada'), (4, 4, '2024-12-10', 'Completada'),
(5, 5, '2025-01-15', 'Completada'), (6, 6, '2025-01-25', 'Completada'),
(7, 7, '2025-02-05', 'Completada'), (8, 8, '2025-02-15', 'Completada'),
(9, 9, '2025-03-10', 'Completada'), (10, 10, '2025-03-20', 'Completada'),
(11, 11, '2025-03-25', 'Completada'), (12, 12, '2025-04-05', 'Completada'),
(13, 13, '2025-04-10', 'Completada'), (14, 14, '2025-04-15', 'Completada'),
(15, 15, '2025-04-20', 'Completada'), (16, 16, '2025-04-25', 'Completada'),
(17, 17, '2025-05-01', 'Completada'), (18, 18, '2025-05-05', 'Completada'),
(1, 1, '2025-05-10', 'Completada'), (2, 2, '2025-05-15', 'Completada');

-- 11. DETALLE DE FACTURA (Este INSERT evalúa el trigger trg_validar_cerdo_activo_venta)
INSERT INTO comercial.detalle_factura (id_factura, id_cerdo, precio_venta_cop) VALUES
(1, 21, 1200000.00), (2, 22, 1150000.00), (3, 23, 1250000.00), (4, 24, 1180000.00),
(5, 25, 1220000.00), (6, 26, 1190000.00), (7, 27, 1240000.00), (8, 28, 1210000.00),
(9, 29, 1260000.00), (10, 30, 1170000.00), (11, 31, 1230000.00), (12, 32, 1205000.00),
(13, 33, 1225000.00), (14, 34, 1195000.00), (15, 35, 1245000.00), (16, 36, 1215000.00),
(17, 37, 1265000.00), (18, 38, 1175000.00), (19, 39, 1235000.00), (20, 40, 1208000.00);

-- 12. ACTUALIZACIÓN DE ESTADO PARA CERDOS VENDIDOS
-- Como insertamos datos crudos sin usar sp_registrar_venta, forzamos la actualización
-- del estado a 'Vendido' para los cerdos facturados (IDs 21 al 40).
UPDATE infraestructura.cerdo SET estado_cerdo = 'Vendido' WHERE id_cerdo BETWEEN 21 AND 40;

-- 13. MORTALIDAD (20 registros, para cerdos 41-60)
-- En este punto, los cerdos 41-60 están 'Activo', lo cual fue necesario para asignarlos a una cochinera.
-- Al insertar en mortalidad, el trigger trg_marcar_cerdo_muerto los actualizará automáticamente a 'Muerto'.
INSERT INTO infraestructura.mortalidad (id_cerdo, fecha_deceso, causa_muerte, metodo_disposicion) VALUES
(41, '2025-01-10', 'Neumonía', 'Enterramiento'), (42, '2025-01-15', 'Infección intestinal', 'Incineración'),
(43, '2025-02-01', 'Accidente', 'Incineración'), (44, '2025-02-05', 'Desconocida', 'Enterramiento'),
(45, '2025-03-12', 'Peste porcina', 'Sanitario especializado'), (46, '2025-03-20', 'Paro cardiaco', 'Enterramiento'),
(47, '2025-04-01', 'Deshidratación', 'Incineración'), (48, '2025-04-10', 'Malformación', 'Incineración'),
(49, '2025-05-05', 'Asfixia', 'Enterramiento'), (50, '2025-05-15', 'Fractura expuesta', 'Incineración'),
(51, '2025-06-01', 'Anemia', 'Enterramiento'), (52, '2025-06-10', 'Infección viral', 'Sanitario especializado'),
(53, '2025-07-05', 'Calor extremo', 'Incineración'), (54, '2025-07-20', 'Hipoterma', 'Enterramiento'),
(55, '2025-08-01', 'Neumonía', 'Incineración'), (56, '2025-08-15', 'Picadura insecto', 'Enterramiento'),
(57, '2025-09-05', 'Intoxicación', 'Incineración'), (58, '2025-09-20', 'Dermatitis severa', 'Sanitario especializado'),
(59, '2025-10-01', 'Ataque animal', 'Enterramiento'), (60, '2025-10-10', 'Causas naturales', 'Incineración');

COMMIT;
