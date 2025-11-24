import React, { useEffect, useRef } from 'react'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/text-button.js'

/**
 * Wrapper React para Material Design 3 Buttons
 *
 * Variantes:
 * - filled (padrão) - botão preenchido
 * - outlined - botão com borda
 * - text - botão apenas texto
 *
 * @param {Object} props
 * @param {'filled'|'outlined'|'text'} props.variant - Variante do botão
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {string} props.type - Tipo do botão (button, submit, reset)
 * @param {Function} props.onClick - Callback de click
 * @param {React.ReactNode} props.children - Conteúdo do botão
 */
export default function Button({
  variant = 'filled',
  disabled = false,
  type = 'button',
  onClick,
  children,
  ...props
}) {
  const buttonRef = useRef(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const handleClick = (e) => {
      if (onClick && !disabled) {
        onClick(e)
      }
    }

    button.addEventListener('click', handleClick)
    return () => button.removeEventListener('click', handleClick)
  }, [onClick, disabled])

  // Sincronizar propriedades booleanas via ref (React 18 não suporta propriedades em Web Components)
  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    button.disabled = disabled
  }, [disabled])

  const tagName = `md-${variant}-button`

  return React.createElement(
    tagName,
    {
      ref: buttonRef,
      type,
      className: `button ${props.className || ''}`.trim(),
      style: {
        padding: '10px'
      },
      ...props
    },
    children
  )
}
