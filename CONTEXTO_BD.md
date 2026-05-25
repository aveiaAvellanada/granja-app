# Contexto de Base de Datos - Granja La Voluntad de Dios

## 1. Resumen General
- **Base de Datos:** `granja_cerdos` (PostgreSQL) - Gestión integral operativa de granja porcina.
- **Objetos:** 5 Schemas, 14 Tablas operacionales (+15 de auditoría), 22 Funciones/SPs, 20 Triggers, 9 Vistas.

## 2. Schemas y su propósito
| Schema | Propósito |
| :--- | :--- |
| `infraestructura` | Gestión de instalaciones (cochineras) y los animales (cerdos, linaje, traslados, mortalidad). |
| `gestion` | Control operativo diario (alimentación, salud, pesajes) y manejo del inventario de insumos. |
| `comercial` | Administración de ventas, clientes, facturación y detalle de animales vendidos. |
| `personal` | Registro de empleados y administradores del sistema. |
| `auditoria` | Tablas espejo para registrar cambios (INSERT/UPDATE/DELETE) en todas las tablas operacionales. |

## 3. Tablas por schema

**Schema: infraestructura**
- `raza_ref`: Catálogo de razas de cerdos.
- `cochinera`: Registro de instalaciones físicas. **Clave:** `estado_cochinera` ('Disponible', 'Llena', 'En Mantenimiento'). **Check:** Capacidad > 0.
- `cerdo`: Núcleo del sistema. Datos del animal y linaje. **Claves:** `estado_cerdo` ('Activo', 'Vendido', 'Muerto'). FKs a madre/padre.
- `mortalidad`: Registro de decesos. **Clave:** FK `id_cerdo` (Unique).
- `historial_traslado`: Movimientos entre cochineras. **Claves:** FKs a `cochinera_origen` y `cochinera_destino`.

**Schema: gestion**
- `categoria_registro_ref`: Catálogo de tipos de registro (Alimentación, Revisión).
- `tipo_item_ref` / `unidad_medida_ref`: Catálogos para el inventario.
- `inventario`: Insumos de la granja (alimento, medicina). **Clave:** `estado_item` ('Disponible', 'Agotado', 'Descontinuado'). **Check:** Stock >= 0.
- `pesaje`: Registro de peso de cerdos. **Claves:** FKs a `cerdo` y `empleado`. **Check:** Peso > 0.
- `registro`: Tabla base para eventos operativos. **Claves:** FKs a `cerdo`, `empleado`, `categoria`.
- `alimentacion`: Detalle de registros de tipo alimentación. **Claves:** FK a `registro`, FK a `inventario`. **Check:** Cantidad > 0.
- `revision_medica`: Detalle de registros de salud. **Claves:** FK a `registro`, FK a `inventario` (medicamento).

**Schema: comercial**
- `cliente`: Datos de compradores. **Clave:** `estado_cliente`.
- `factura`: Cabecera de venta. **Claves:** FKs a `cliente` y `empleado`, `estado_factura` ('Completada', 'Anulada', 'Pendiente').
- `detalle_factura`: Cerdos vendidos por factura. **Claves:** FKs a `factura` y `cerdo`. **Check:** Precio > 0.

**Schema: personal**
- `administrador`: Usuarios con acceso total.
- `empleado`: Personal operativo. **Claves:** FK a `administrador`, `estado_empleado`.

## 4. Relaciones clave (Arquitectura)
- **Cerdo -> Linaje:** Autoreferencia (`id_cerdo_padre`, `id_cerdo_madre`) en `cerdo`.
- **Cerdo -> Ubicación:** `historial_traslado` conecta `cerdo` con `cochinera` (origen y destino).
- **Operación -> Entidades:** `registro` conecta la acción con un `cerdo` y el `empleado` responsable.
- **Detalle Operativo -> Inventario:** `alimentacion` y `revision_medica` extienden `registro` y descuentan del `inventario`.
- **Venta -> Cerdo:** `detalle_factura` asocia una `factura` con los `cerdo`s específicos vendidos.

## 5. Funciones y procedimientos

**Consultas y Lógica de Negocio (Funciones)**
- `fn_cochinera_actual(INT)` -> `INT`: Obtiene ID de cochinera donde está un cerdo.
- `fn_ultimo_peso(INT)` -> `NUMERIC`: Retorna el último pesaje registrado de un cerdo.
- `fn_edad_cerdo(INT)` -> `INT`: Calcula edad en días de un cerdo.
- `fn_reporte_mensual(INT, INT)` -> `TABLE`: Genera métricas agregadas por año/mes (para MongoDB).
- `fn_ocupacion_cochinera(INT)` -> `INT`: Retorna cantidad de cerdos activos en una cochinera.
- `fn_resumen_cochineras()` -> `TABLE`: Lista ocupación y estado de todas las instalaciones.
- `fn_arbol_genealogico(INT)` -> `TABLE`: Retorna linaje recursivo de un cerdo.
- `fn_historial_peso(INT)` -> `TABLE`: Muestra pesos y ganancia diaria por cerdo.
- `fn_inventario_bajo(NUMERIC)` -> `TABLE`: Lista ítems con stock menor al umbral dado.
- `fn_consumo_alimento_por_periodo(DATE, DATE)` -> `TABLE`: Consumo agregado por ítem.
- `fn_cerdos_sin_pesaje_reciente(INT)` -> `TABLE`: Alerta de cerdos sin control de peso en X días.
- `fn_cerdos_sin_revision_reciente(INT)` -> `TABLE`: Alerta de cerdos sin control médico en X días.
- `fn_ventas_por_periodo(DATE, DATE)` -> `TABLE`: Facturas emitidas en un rango.
- `fn_dashboard_ventas(INT)` -> `TABLE`: Ingresos y volumen agrupado por mes (para MongoDB).
- `fn_actividad_empleado(INT, DATE, DATE)` -> `TABLE`: Auditoría de acciones de un trabajador.

**Procedimientos Almacenados (SPs)**
- `sp_registrar_alimentacion(...)`: Inserta en `registro` y `alimentacion`, delega descuento de stock a trigger.
- `sp_trasladar_cerdo(...)`: Registra movimiento en `historial_traslado`.
- `sp_registrar_muerte(...)`: Inserta en `mortalidad` (trigger actualiza estado cerdo).
- `sp_registrar_cerdo(...)`: Da de alta un animal y registra su ubicación inicial.
- `sp_registrar_revision_medica(...)`: Inserta en `registro` y `revision_medica`.
- `sp_registrar_venta(...)`: Crea factura, detalle y actualiza estado de cerdos a 'Vendido'.
- `sp_anular_factura(INT)`: Cambia estado a 'Anulada' y revierte cerdos a 'Activo'.

## 6. Triggers
| Trigger | Tabla | Momento | Efecto |
| :--- | :--- | :--- | :--- |
| `trg_auditoria_*` | *Todas (14 tablas)* | AFTER | Registra copia exacta de fila nueva/borrada en schema `auditoria` y en `auditoria.eventos`. |
| `trg_validar_capacidad_cochinera` | `historial_traslado` | BEFORE INS | Bloquea traslado si cochinera destino no tiene espacio. |
| `trg_validar_cerdo_activo_venta` | `detalle_factura` | BEFORE INS | Bloquea venta si el cerdo no tiene estado 'Activo'. |
| `trg_validar_cerdo_activo_traslado`| `historial_traslado` | BEFORE INS | Bloquea traslado si el cerdo no tiene estado 'Activo'. |
| `trg_actualizar_estado_cochinera` | `historial_traslado` | AFTER INS/DEL| Actualiza estado de cochinera a 'Llena' o 'Disponible' según ocupación actual. |
| `trg_descontar_inventario_alimentacion`| `alimentacion` | AFTER INS | Resta stock del inventario; si llega a 0, marca como 'Agotado'. |
| `trg_descontar_medicamento_revision`| `revision_medica` | AFTER INS | Resta 1 unidad del medicamento en inventario si aplica. |
| `trg_marcar_cerdo_muerto` | `mortalidad` | AFTER INS | Cambia automáticamente estado del cerdo a 'Muerto'. |

## 7. Vistas
- `vw_cerdos_activos`: Retorna cerdos vivos con raza, edad, último peso y cochinera actual. Base para grid principal.
- `vw_inventario_disponible`: Insumos no descontinuados con stock y tipo. Para listados de insumos.
- `vw_ventas_por_cliente`: Totales gastados y animales comprados por cliente.
- `vw_mortalidad_por_mes`: Agrupación de decesos por año/mes/raza.
- `vw_consumo_alimento`: Log detallado de qué empleado alimentó a qué cerdo y con qué.
- `vw_historial_peso_cerdo`: Histórico de peso por cerdo incluyendo cálculo de ganancia diaria (GDP).
- `vw_ocupacion_cochineras`: Capacidad, ocupación actual, espacios libres y estado por instalación.
- `vw_cerdos_vendibles`: Cerdos activos con al menos un pesaje. Para dropdowns de ventas.
- `vw_alertas_operativas`: Unión de alertas: stock bajo, cerdos sin pesar, cerdos sin revisión.

## 8. Sistema de auditoría
- **Flujo:** Triggers AFTER (INSERT/UPDATE/DELETE) en cada tabla operativa disparan la función `fn_auditoria_[tabla]`.
- **Efecto Local:** Se inserta una fila en la tabla homónima en el schema `auditoria` detallando datos, acción (I/U/D), usuario de BD y timestamp.
- **Sincronización:** Se inserta un payload JSON en `auditoria.eventos` con `sincronizado = FALSE`. Un worker de Node.js lee esta tabla, envía a MongoDB y marca como `TRUE`.

## 9. Roles y permisos
| Rol | Permisos Principales |
| :--- | :--- |
| `rol_administrador` | USAGE total. EXECUTE en todos los SPs/Funciones. ALL PRIVILEGES en todas las tablas y secuencias. |
| `rol_empleado` | USAGE limitado. EXECUTE en SPs operativos (traslado, alimentación, venta). SELECT/INSERT en operativas. |
| `rol_veterinario` | USAGE limitado. EXECUTE en SPs médicos/pesajes. SELECT/INSERT en salud y animal. No toca ventas. |
| `rol_solo_lectura` | USAGE en schemas. Solo SELECT en Vistas y tablas operativas. EXECUTE en reportes. UPDATE en `eventos` (sync). |

## 10. Reglas de negocio críticas
- Un cerdo no puede ser su propio padre o madre (Check).
- Un cerdo no puede venderse ni trasladarse si está 'Muerto' o 'Vendido' (Triggers).
- No se puede trasladar animales a una cochinera que supera su `capacidad_max` (Trigger).
- La facturación actualiza implícitamente el estado de múltiples cerdos; anularla revierte el estado (SP).
- El stock de inventario no puede ser negativo (Check) y se descuenta automáticamente en operaciones diarias (Triggers).
- Trazabilidad forzosa: Ninguna operación escapa al schema `auditoria` ni al flujo hacia MongoDB (Triggers a nivel de fila).

## 11. Columnas exactas por tabla

**infraestructura.raza_ref**
- `id_raza`: SMALLINT
- `descripcion`: VARCHAR(25)

**infraestructura.cochinera**
- `id_cochinera`: INTEGER
- `capacidad_max`: INT
- `estado_cochinera`: VARCHAR(20)

**infraestructura.cerdo**
- `id_cerdo`: INTEGER
- `sexo_cerdo`: VARCHAR(6)
- `id_raza`: SMALLINT
- `fecha_nacimiento`: DATE
- `estado_cerdo`: VARCHAR(15)
- `id_cerdo_padre`: INT
- `id_cerdo_madre`: INT

**infraestructura.mortalidad**
- `id_mortalidad`: INTEGER
- `id_cerdo`: INT
- `fecha_deceso`: TIMESTAMP
- `causa_muerte`: TEXT
- `metodo_disposicion`: VARCHAR(100)

**infraestructura.historial_traslado**
- `id_traslado`: INTEGER
- `id_cerdo`: INT
- `id_cochinera_origen`: INT
- `id_cochinera_destino`: INT
- `fecha_traslado`: TIMESTAMP
- `motivo`: VARCHAR(200)

**personal.administrador**
- `id_admin`: INTEGER
- `p_nombre`: VARCHAR(30)
- `s_nombre`: VARCHAR(30)
- `p_apellido`: VARCHAR(30)
- `s_apellido`: VARCHAR(30)
- `correo_admin`: VARCHAR(100)
- `contrasena_admin`: TEXT

**personal.empleado**
- `id_empleado`: INTEGER
- `p_nombre`: VARCHAR(30)
- `s_nombre`: VARCHAR(30)
- `p_apellido`: VARCHAR(30)
- `s_apellido`: VARCHAR(30)
- `cedula_empleado`: VARCHAR(12)
- `estado_empleado`: VARCHAR(15)
- `id_admin`: INT

**gestion.categoria_registro_ref**
- `id_categoria`: SMALLINT
- `descripcion`: VARCHAR(50)

**gestion.tipo_item_ref**
- `id_tipo_item`: INTEGER
- `descripcion`: VARCHAR(100)

**gestion.unidad_medida_ref**
- `id_unidad`: INTEGER
- `nombre`: VARCHAR(25)
- `abreviatura`: VARCHAR(10)

**gestion.inventario**
- `id_item`: INTEGER
- `nombre_item`: VARCHAR(100)
- `id_tipo_item`: INT
- `cantidad_stock`: NUMERIC(12,2)
- `id_unidad_base`: INT
- `estado_item`: VARCHAR(25)

**gestion.pesaje**
- `id_pesaje`: INTEGER
- `id_cerdo`: INT
- `id_empleado`: INT
- `fecha_pesaje`: TIMESTAMP
- `peso_kg`: NUMERIC(6,2)
- `observaciones`: TEXT

**gestion.registro**
- `id_registro`: INTEGER
- `id_cerdo`: INT
- `id_empleado`: INT
- `id_categoria`: SMALLINT
- `fecha_registro`: TIMESTAMP
- `observaciones`: TEXT

**gestion.alimentacion**
- `id_registro`: INT
- `id_categoria`: SMALLINT
- `id_item`: INT
- `cantidad_consumida`: NUMERIC(8,2)
- `id_unidad`: INT

**gestion.revision_medica**
- `id_registro`: INT
- `id_categoria`: SMALLINT
- `diagnostico`: TEXT
- `id_medicamento_aplicado`: INT

**comercial.cliente**
- `id_cliente`: INTEGER
- `p_nombre`: VARCHAR(30)
- `s_nombre`: VARCHAR(30)
- `p_apellido`: VARCHAR(30)
- `s_apellido`: VARCHAR(30)
- `cedula_cliente`: VARCHAR(12)
- `telefono`: VARCHAR(10)
- `correo_cliente`: VARCHAR(100)
- `estado_cliente`: VARCHAR(15)

**comercial.factura**
- `id_factura`: INTEGER
- `id_cliente`: INT
- `id_empleado`: INT
- `fecha_venta`: TIMESTAMP
- `estado_factura`: VARCHAR(15)

**comercial.detalle_factura**
- `id_detalle`: INTEGER
- `id_factura`: INT
- `id_cerdo`: INT
- `precio_venta_cop`: NUMERIC(15,2)

## 12. Parámetros exactos de stored procedures

- `gestion.sp_registrar_alimentacion`
  1. `p_id_cerdo`: INT
  2. `p_id_empleado`: INT
  3. `p_id_item`: INT
  4. `p_cantidad`: NUMERIC
  5. `p_id_unidad`: INT
  6. `p_observaciones`: TEXT (DEFAULT NULL)

- `infraestructura.sp_trasladar_cerdo`
  1. `p_id_cerdo`: INT
  2. `p_id_cochinera_destino`: INT
  3. `p_motivo`: VARCHAR (DEFAULT NULL)

- `infraestructura.sp_registrar_muerte`
  1. `p_id_cerdo`: INT
  2. `p_causa`: TEXT
  3. `p_metodo_disposicion`: VARCHAR (DEFAULT NULL)

- `infraestructura.sp_registrar_cerdo`
  1. `p_sexo`: VARCHAR
  2. `p_id_raza`: SMALLINT
  3. `p_fecha_nac`: DATE
  4. `p_id_padre`: INT (DEFAULT NULL)
  5. `p_id_madre`: INT (DEFAULT NULL)
  6. `p_id_cochinera`: INT (DEFAULT NULL)

- `gestion.sp_registrar_revision_medica`
  1. `p_id_cerdo`: INT
  2. `p_id_empleado`: INT
  3. `p_diagnostico`: TEXT
  4. `p_id_medicamento`: INT (DEFAULT NULL)
  5. `p_observaciones`: TEXT (DEFAULT NULL)

- `comercial.sp_registrar_venta`
  1. `p_id_cliente`: INT
  2. `p_id_empleado`: INT
  3. `p_ids_cerdos`: INT[]
  4. `p_precios`: NUMERIC[]

- `comercial.sp_anular_factura`
  1. `p_id_factura`: INT

## 13. Datos semilla existentes

**infraestructura.raza_ref**
- `1`: 'Large White'
- `2`: 'Landrace'
- `3`: 'Duroc'

**gestion.categoria_registro_ref**
- `1`: 'Alimentacion'
- `2`: 'Revision Medica'

**gestion.tipo_item_ref**
- `1` ('Alimento Concentrado')
- `2` ('Medicamento')
- `3` ('Suplemento')

**gestion.unidad_medida_ref**
- `1` ('Kilogramos', 'kg')
- `2` ('Gramos', 'g')
- `3` ('Litros', 'L')
- `4` ('Unidades', 'und')

**personal.administrador**
- Se inserta 1 administrador por defecto:
  - `p_nombre`: 'Camilo'
  - `p_apellido`: 'Lopez'
  - `correo_admin`: 'camilo@granja.com'
  - `contrasena_admin`: Encriptada (crypt con bcrypt)
