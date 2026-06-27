import { useState, useEffect, useCallback } from 'react'
import {
  getCuentasCredito,
  getCuotas,
  getObservacionesCredito,
} from '../services/cuentasService.js'
import { extractError } from '../utils/format.js'

// Lista de créditos del cliente.
export function useCreditos() {
  const [creditos, setCreditos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCreditos(await getCuentasCredito())
    } catch (err) {
      setError(extractError(err, 'No se pudieron cargar los créditos.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { creditos, loading, error, recargar: cargar }
}

// Cronograma de cuotas de un crédito.
export function useCuotas(codcuentacredito) {
  const [cuotas, setCuotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    if (!codcuentacredito) return
    setLoading(true)
    setError(null)
    try {
      setCuotas(await getCuotas(codcuentacredito))
    } catch (err) {
      setError(extractError(err, 'No se pudo cargar el cronograma de cuotas.'))
    } finally {
      setLoading(false)
    }
  }, [codcuentacredito])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { cuotas, loading, error, recargar: cargar }
}

export function useObservacionesCreditos(creditos = []) {
  const [observaciones, setObservaciones] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const codigos = creditos.map((c) => c.codcuentacredito).filter(Boolean).join('|')

  const cargar = useCallback(async () => {
    const lista = creditos.filter((c) => c.codcuentacredito)
    if (lista.length === 0) {
      setObservaciones({})
      return
    }
    setLoading(true)
    setError(null)
    try {
      const pares = await Promise.all(
        lista.map(async (c) => [
          c.codcuentacredito,
          await getObservacionesCredito(c.codcuentacredito),
        ]),
      )
      setObservaciones(Object.fromEntries(pares))
    } catch (err) {
      setError(extractError(err, 'No se pudieron cargar las observaciones.'))
    } finally {
      setLoading(false)
    }
  }, [codigos])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!codigos) return undefined
    const id = window.setInterval(cargar, 30000)
    function onFocus() {
      cargar()
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [cargar, codigos])

  return { observaciones, loading, error, recargar: cargar }
}

export default useCreditos
