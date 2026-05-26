export function errorMiddleware(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  
  // Error de PostgreSQL
  if (err.code) {
    switch(err.code) {
      case '23505': // unique violation
        return res.status(409).json({ 
          error: 'Ya existe un registro con esos datos' 
        })
      case '23503': // foreign key violation
        return res.status(400).json({ 
          error: 'Referencia a un registro que no existe' 
        })
      case '23514': // check violation
        return res.status(400).json({ 
          error: 'Los datos no cumplen las reglas de validación' 
        })
      case 'P0001': // raise exception (nuestros SPs)
        return res.status(400).json({ 
          error: err.message 
        })
      default:
        // No devolver el error detallado de la BD al cliente por seguridad si no es conocido
        return res.status(500).json({ 
          error: 'Error en la base de datos' 
        })
    }
  }
  
  // Error genérico
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor' 
  })
}
