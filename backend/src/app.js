import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectMongo } from './config/db.mongo.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import authRoutes from './routes/auth.routes.js'
import cerdosRoutes from './routes/cerdos.routes.js'
import cochincerasRoutes from './routes/cochineras.routes.js'
import empleadosRoutes from './routes/empleados.routes.js'
import inventarioRoutes from './routes/inventario.routes.js'
import pesajesRoutes from './routes/pesajes.routes.js'
import veterinarioRoutes from './routes/veterinario.routes.js'
import registrosRoutes from './routes/registros.routes.js'
import ventasRoutes from './routes/ventas.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import clientesRoutes from './routes/clientes.routes.js'
import razasRoutes from './routes/razas.routes.js'
import reportesRoutes from './routes/reportes.routes.js'
import { authMiddleware } from './middleware/auth.middleware.js'
import { startSyncWorker } from './workers/sync.worker.js'

const app = express()

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://granja-app-virid.vercel.app',
    'https://granja-app-git-main-aveiaavellanadas-projects.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/cerdos', cerdosRoutes)
app.use('/api/cochineras', cochincerasRoutes)
app.use('/api/empleados', empleadosRoutes)
app.use('/api/inventario', inventarioRoutes)
app.use('/api/pesajes', pesajesRoutes)
app.use('/api/veterinario', veterinarioRoutes)
app.use('/api/registros', authMiddleware, registrosRoutes)
app.use('/api/ventas', ventasRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/razas', authMiddleware, razasRoutes)
app.use('/api/reportes', authMiddleware, reportesRoutes)

app.use(errorMiddleware)

const PORT = process.env.PORT || 3000

async function bootstrap() {
  await connectMongo()
  startSyncWorker()
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
  })
}

bootstrap().catch(console.error)

export default app
