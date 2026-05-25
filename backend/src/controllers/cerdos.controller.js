import pool from '../config/db.postgres.js'

export async function getCerdos(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM infraestructura.vw_cerdos_activos ORDER BY id_cerdo DESC')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getCerdo(req, res, next) {
  try {
    const { id } = req.params
    const [cerdo, genealogia] = await Promise.all([
      pool.query('SELECT * FROM infraestructura.vw_cerdos_activos WHERE id_cerdo = $1', [id]),
      pool.query('SELECT * FROM infraestructura.fn_arbol_genealogico($1)', [id]),
    ])
    if (cerdo.rows.length === 0) {
      return res.status(404).json({ error: 'Cerdo no encontrado' })
    }
    res.json({ cerdo: cerdo.rows[0], genealogia: genealogia.rows })
  } catch (err) {
    next(err)
  }
}

export async function registrarCerdo(req, res, next) {
  try {
    const { sexo, id_raza, fecha_nac, id_padre, id_madre, id_cochinera } = req.body
    await pool.query(
      'SELECT infraestructura.sp_registrar_cerdo($1,$2,$3,$4,$5,$6)',
      [sexo, id_raza, fecha_nac, id_padre ?? null, id_madre ?? null, id_cochinera]
    )
    res.status(201).json({ message: 'Cerdo registrado' })
  } catch (err) {
    next(err)
  }
}

export async function trasladarCerdo(req, res, next) {
  try {
    const { id } = req.params
    const { id_cochinera_destino, motivo } = req.body
    await pool.query(
      'SELECT infraestructura.sp_trasladar_cerdo($1,$2,$3)',
      [id, id_cochinera_destino, motivo]
    )
    res.json({ message: 'Cerdo trasladado' })
  } catch (err) {
    next(err)
  }
}

export async function registrarMuerte(req, res, next) {
  try {
    const { id } = req.params
    const { causa, metodo_disposicion } = req.body
    await pool.query(
      'SELECT infraestructura.sp_registrar_muerte($1,$2,$3)',
      [id, causa, metodo_disposicion]
    )
    res.json({ message: 'Muerte registrada' })
  } catch (err) {
    next(err)
  }
}

export async function getHistorialPeso(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT * FROM gestion.vw_historial_peso_cerdo WHERE id_cerdo = $1 ORDER BY fecha_pesaje',
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
