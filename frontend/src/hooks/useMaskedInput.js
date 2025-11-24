import { useEffect, useRef } from 'react'
import IMask from 'imask'

/**
 * Hook para aplicar máscaras em inputs usando IMask
 * @param {Object} maskOptions - Opções do IMask
 * @param {Function} onAccept - Callback quando valor mascarado muda
 * @param {Function} onComplete - Callback quando valor está completo
 * @returns {Object} Ref para o elemento input
 */
export function useMaskedInput(maskOptions, onAccept, onComplete) {
  const elementRef = useRef(null)
  const maskRef = useRef(null)

  useEffect(() => {
    if (!elementRef.current || !maskOptions) return

    // Cria instância do IMask
    maskRef.current = IMask(elementRef.current, maskOptions)

    // Handler para quando o valor muda
    if (onAccept) {
      maskRef.current.on('accept', () => {
        onAccept({
          masked: maskRef.current.value,
          unmasked: maskRef.current.unmaskedValue,
        })
      })
    }

    // Handler para quando o valor está completo
    if (onComplete) {
      maskRef.current.on('complete', () => {
        onComplete({
          masked: maskRef.current.value,
          unmasked: maskRef.current.unmaskedValue,
        })
      })
    }

    // Cleanup
    return () => {
      if (maskRef.current) {
        maskRef.current.destroy()
      }
    }
  }, [maskOptions, onAccept, onComplete])

  // Método para atualizar o valor programaticamente
  const setValue = (value) => {
    if (maskRef.current) {
      maskRef.current.value = value || ''
    }
  }

  return { elementRef, setValue }
}
