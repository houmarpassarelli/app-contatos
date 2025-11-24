import React, { useEffect, useRef } from 'react'
import '@material/web/iconbutton/icon-button.js'
import Icon from './Icon'

/**
 * Wrapper React para Material Design 3 Icon Button
 *
 * @param {Object} props
 * @param {Function} props.onClick - Callback de click
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {React.ReactNode} props.children - Nome do ícone Material Symbol (ex: 'arrow_back')
 */
export default function IconButton({
  onClick,
  disabled = false,
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

  return React.createElement(
    'md-icon-button',
    {
      ref: buttonRef,
      ...props
    },
    React.createElement(Icon, null, children)
  )
}
