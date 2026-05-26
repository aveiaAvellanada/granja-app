# CLAUDE.md — Granja La Voluntad de Dios
Instrucciones completas para Claude Code. Lee este archivo completo antes de generar cualquier código.

---

## 1. Descripción del proyecto

Aplicativo web para el control de producción porcina de la granja "La Voluntad de Dios".
Permite gestionar cerdos, cochineras, alimentación, revisiones médicas, pesajes, ventas e inventario.

**La app NO es local.** Todo corre en la nube:
- Backend desplegado en Railway
- Frontend desplegado en Vercel
- Base de datos relacional en Supabase (PostgreSQL)
- Base de datos analítica en MongoDB Atlas

---

## 2. Stack tecnológico

```
Backend:   Node.js v25 + Express
Frontend:  React + Vite
BD 1:      PostgreSQL en Neon
BD 2:      MongoDB Atlas (granja_analytics)
Deploy:    Railway (backend) + Vercel (frontend)
Auth:      JWT con bcrypt — login con usuario y contraseña
```

---

## 3. Variables de entorno

**NUNCA escribas credenciales en el código.**
Usa siempre `process.env.NOMBRE_VARIABLE`.

El archivo `.env` del backend debe tener esta estructura
(los valores reales los pone el desarrollador, no Claude Code):

```env
# PostgreSQL — Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.fnrgysijohuybdrihhmg.supabase.co:5432/postgres

# MongoDB Atlas
MONGODB_URI=mongodb+srv://app_granja:[PASSWORD]@granja-cluster.l9ero0c.mongodb.net/granja_analytics?appName=granja-cluster

# JWT
JWT_SECRET=una_clave_secreta_larga_y_aleatoria
JWT_EXPIRES_IN=8h

# Servidor
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

El archivo `.env` debe estar en `.gitignore`. Crea siempre un `.env.example` con las claves sin valores.

---

## 4. Estructura de carpetas

```
granja-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.postgres.js       # Pool de conexión PostgreSQL
│   │   │   └── db.mongo.js          # Conexión MongoDB
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # Verificación JWT
│   │   │   └── error.middleware.js  # Manejo global de errores
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── cerdos.routes.js
│   │   │   ├── cochineras.routes.js
│   │   │   ├── empleados.routes.js
│   │   │   ├── inventario.routes.js
│   │   │   ├── pesajes.routes.js
│   │   │   ├── ventas.routes.js
│   │   │   ├── veterinario.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── cerdos.controller.js
│   │   │   ├── cochineras.controller.js
│   │   │   ├── empleados.controller.js
│   │   │   ├── inventario.controller.js
│   │   │   ├── pesajes.controller.js
│   │   │   ├── ventas.controller.js
│   │   │   ├── veterinario.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── workers/
│   │   │   └── sync.worker.js       # Sincronización PostgreSQL → MongoDB
│   │   └── app.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                     # Llamadas axios al backend
    │   ├── components/              # Componentes reutilizables
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Cerdos.jsx
    │   │   ├── Cochineras.jsx
    │   │   ├── Empleados.jsx
    │   │   ├── Inventario.jsx
    │   │   ├── Pesajes.jsx
    │   │   ├── Ventas.jsx
    │   │   └── Veterinario.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx      # Estado global de autenticación
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── .gitignore
    └── package.json
```

---

## 5. Base de datos PostgreSQL — reglas críticas

### 5.1 Conexión
```javascript
// config/db.postgres.js
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export default pool
```

### 5.2 Regla de oro — SIEMPRE queries parametrizadas
```javascript
// ✅ CORRECTO — siempre así
const result = await pool.query(
  'SELECT * FROM infraestructura.cerdo WHERE id_cerdo = $1',
  [id]
)

// ❌ NUNCA así — vulnerable a SQL injection
const result = await pool.query(
  `SELECT * FROM infraestructura.cerdo WHERE id_cerdo = ${id}`
)
```

### 5.3 Usar siempre los procedimientos almacenados existentes
La lógica de negocio ya está implementada en PostgreSQL. El backend solo llama las funciones:

```javascript
// Registrar cerdo
await pool.query(
  'SELECT infraestructura.sp_registrar_cerdo($1,$2,$3,$4,$5,$6)',
  [sexo, id_raza, fecha_nac, id_padre, id_madre, id_cochinera]
)

// Trasladar cerdo
await pool.query(
  'SELECT infraestructura.sp_trasladar_cerdo($1,$2,$3)',
  [id_cerdo, id_cochinera_destino, motivo]
)

// Registrar venta
await pool.query(
  'SELECT comercial.sp_registrar_venta($1,$2,$3,$4)',
  [id_cliente, id_empleado, ids_cerdos, precios]
)

// Registrar alimentación
await pool.query(
  'SELECT gestion.sp_registrar_alimentacion($1,$2,$3,$4,$5,$6)',
  [id_cerdo, id_empleado, id_item, cantidad, id_unidad, observaciones]
)

// Registrar revisión médica
await pool.query(
  'SELECT gestion.sp_registrar_revision_medica($1,$2,$3,$4,$5)',
  [id_cerdo, id_empleado, diagnostico, id_medicamento, observaciones]
)

// Registrar muerte
await pool.query(
  'SELECT infraestructura.sp_registrar_muerte($1,$2,$3)',
  [id_cerdo, causa, metodo_disposicion]
)

// Anular factura
await pool.query(
  'SELECT comercial.sp_anular_factura($1)',
  [id_factura]
)
```

### 5.4 Vistas disponibles para consultas de lectura
```javascript
// Cerdos activos con raza, edad, peso y cochinera
SELECT * FROM infraestructura.vw_cerdos_activos

// Ocupación de cochineras en tiempo real
SELECT * FROM infraestructura.vw_ocupacion_cochineras

// Inventario disponible
SELECT * FROM gestion.vw_inventario_disponible

// Cerdos vendibles (activos con al menos un pesaje)
SELECT * FROM comercial.vw_cerdos_vendibles

// Alertas operativas (stock bajo + sin pesar + sin revisión)
SELECT * FROM gestion.vw_alertas_operativas

// Ventas por cliente
SELECT * FROM comercial.vw_ventas_por_cliente

// Historial de peso con GDP
SELECT * FROM gestion.vw_historial_peso_cerdo WHERE id_cerdo = $1

// Mortalidad por mes
SELECT * FROM infraestructura.vw_mortalidad_por_mes

// Consumo de alimento
SELECT * FROM gestion.vw_consumo_alimento
```

### 5.5 Funciones analíticas disponibles
```javascript
// Reporte mensual (alimenta MongoDB)
SELECT * FROM gestion.fn_reporte_mensual($1, $2)  -- anio, mes

// Dashboard de ventas por año
SELECT * FROM comercial.fn_dashboard_ventas($1)  -- anio

// Árbol genealógico de un cerdo
SELECT * FROM infraestructura.fn_arbol_genealogico($1)  -- id_cerdo

// Actividad de un empleado
SELECT * FROM personal.fn_actividad_empleado($1,$2,$3)  -- id, fecha_ini, fecha_fin

// Inventario bajo stock
SELECT * FROM gestion.fn_inventario_bajo($1)  -- umbral (default 10)
```

---

## 6. Base de datos MongoDB — reglas

### 6.1 Conexión
```javascript
// config/db.mongo.js
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
export const db = client.db('granja_analytics')
```

### 6.2 Colecciones y su propósito
```
reportes_mensuales  → snapshots mensuales de fn_reporte_mensual()
auditoria_eventos   → espejo de auditoria.eventos de PostgreSQL
dashboard_cache     → cache de vistas pesadas (alertas, ventas, cochineras)
app_logs            → logs de la aplicación generados por el backend
```

### 6.3 Consultas frecuentes
```javascript
// Reporte de un mes específico
db.collection('reportes_mensuales').findOne({ anio: 2026, mes: 5 })

// Eventos no sincronizados (worker de sync)
db.collection('auditoria_eventos').find({ sincronizado: false })

// Cache del dashboard por tipo
db.collection('dashboard_cache').findOne({ tipo: 'alertas_operativas' })

// Logs de error
db.collection('app_logs').find({ nivel: 'ERROR' }).sort({ fecha: -1 })
```

---

## 7. Autenticación JWT

```javascript
// Login — verificar contra personal.administrador o personal.empleado
// La contraseña está hasheada con bcrypt (pgcrypto en PostgreSQL)
// Comparar con bcrypt.compare() en Node.js

// El token JWT debe incluir:
{
  id: usuario.id,
  rol: 'administrador' | 'empleado' | 'veterinario',
  nombre: usuario.nombre
}

// Rutas protegidas usan el middleware auth.middleware.js
// que verifica el token en el header: Authorization: Bearer <token>
```

---

## 8. Módulos y endpoints de la API

### Auth
```
POST /api/auth/login       → login, devuelve JWT
POST /api/auth/logout      → invalida sesión
GET  /api/auth/me          → datos del usuario autenticado
```

### Cerdos
```
GET  /api/cerdos                    → vw_cerdos_activos
GET  /api/cerdos/:id                → detalle + árbol genealógico
POST /api/cerdos                    → sp_registrar_cerdo
POST /api/cerdos/:id/trasladar      → sp_trasladar_cerdo
POST /api/cerdos/:id/muerte         → sp_registrar_muerte
GET  /api/cerdos/:id/historial-peso → vw_historial_peso_cerdo
```

### Cochineras
```
GET  /api/cochineras          → vw_ocupacion_cochineras
POST /api/cochineras          → INSERT directo
PUT  /api/cochineras/:id      → UPDATE estado
```

### Empleados
```
GET  /api/empleados           → personal.empleado
POST /api/empleados           → INSERT directo
PUT  /api/empleados/:id       → UPDATE estado
GET  /api/empleados/:id/actividad → fn_actividad_empleado
```

### Inventario
```
GET  /api/inventario          → vw_inventario_disponible
GET  /api/inventario/alertas  → fn_inventario_bajo
POST /api/inventario          → INSERT directo
PUT  /api/inventario/:id      → UPDATE stock
```

### Pesajes
```
GET  /api/pesajes             → gestion.pesaje
POST /api/pesajes             → INSERT directo en gestion.pesaje
GET  /api/pesajes/pendientes  → fn_cerdos_sin_pesaje_reciente
```

### Ventas
```
GET  /api/ventas              → fn_ventas_por_periodo
POST /api/ventas              → sp_registrar_venta
PUT  /api/ventas/:id/anular   → sp_anular_factura
GET  /api/ventas/dashboard    → fn_dashboard_ventas (lee MongoDB)
```

### Veterinario
```
GET  /api/veterinario/pendientes   → fn_cerdos_sin_revision_reciente
POST /api/veterinario/revision     → sp_registrar_revision_medica
GET  /api/veterinario/:id_cerdo    → historial revisiones médicas
```

### Dashboard
```
GET  /api/dashboard/resumen       → lee MongoDB dashboard_cache
GET  /api/dashboard/alertas       → lee MongoDB dashboard_cache tipo alertas
GET  /api/dashboard/ventas/:anio  → lee MongoDB dashboard_cache tipo ventas
GET  /api/dashboard/cochineras    → lee MongoDB dashboard_cache tipo cochineras
```

---

## 9. Worker de sincronización PostgreSQL → MongoDB

```javascript
// workers/sync.worker.js
// Se ejecuta cada 5 minutos con setInterval
// 1. Lee auditoria.eventos WHERE sincronizado = FALSE ORDER BY fecha_hora
// 2. Para cada evento: inserta en MongoDB auditoria_eventos
// 3. Marca sincronizado = TRUE en PostgreSQL
// 4. Cada inicio de mes: llama fn_reporte_mensual() e inserta en reportes_mensuales
// 5. Cada hora: refresca dashboard_cache con datos frescos de PostgreSQL
```

---

## 10. Módulos del frontend React

### Páginas requeridas
```
/login              → Login.jsx — formulario de acceso
/dashboard          → Dashboard.jsx — gráficas y alertas (lee MongoDB)
/cerdos             → Cerdos.jsx — listado, registro, traslados
/cerdos/:id         → detalle con árbol genealógico y gráfica de peso
/cochineras         → Cochineras.jsx — mapa visual de ocupación
/empleados          → Empleados.jsx — gestión de personal
/inventario         → Inventario.jsx — stock y alertas
/ventas             → Ventas.jsx — facturas y nueva venta
/veterinario        → Veterinario.jsx — revisiones médicas pendientes
```

### Librerías del frontend
```
axios               → llamadas a la API
react-router-dom    → navegación entre páginas
recharts            → gráficas del dashboard
react-hook-form     → manejo de formularios
```

---

## 11. Reglas generales de desarrollo

1. **Seguridad:** queries siempre parametrizadas, nunca concatenar inputs del usuario en SQL o MongoDB queries
2. **Arquitectura 3 capas:** Frontend → API REST → Base de datos. El frontend nunca toca la BD directamente
3. **Lógica de negocio:** vive en PostgreSQL (stored procedures). El backend solo orquesta, no reimplementa
4. **Errores:** siempre capturar con try/catch y devolver mensajes claros al frontend
5. **CORS:** configurar para aceptar solo desde `FRONTEND_URL`
6. **Variables de entorno:** nunca hardcodear credenciales
7. **MongoDB:** solo para lectura analítica y cache. Las escrituras transaccionales siempre van a PostgreSQL primero
8. **.gitignore:** incluir `node_modules/`, `.env`, `dist/`

---

## 12. Comandos para iniciar el proyecto

```bash
# Backend
cd backend
npm install
npm run dev       # nodemon src/app.js

# Frontend
cd frontend
npm install
npm run dev       # vite
```

---

## 13. Orden de generación sugerido

Genera el proyecto en este orden:
1. Estructura de carpetas y package.json de ambos
2. Configuración de BD (db.postgres.js y db.mongo.js)
3. app.js con Express, CORS y rutas base
4. auth.middleware.js y auth.routes.js + auth.controller.js
5. Rutas y controladores en este orden: cerdos → cochineras → empleados → inventario → pesajes → veterinario → ventas → dashboard
6. sync.worker.js
7. Frontend: AuthContext → Login → Dashboard → resto de páginas
