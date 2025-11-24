import React, { useEffect, useRef } from 'react'
import '@material/web/fab/fab.js'

/**
 * Wrapper React para Material Design 3 Floating Action Button
 *
 * @param {Object} props
 * @param {Function} props.onClick - Callback de click
 * @param {string} props.icon - Ícone (texto, ex: "add", "edit")
 * @param {string} props.label - Label opcional
 * @param {'surface'|'primary'|'secondary'|'tertiary'} props.variant - Variante
 */
export default function FAB({
  onClick,
  icon = 'add',
  label,
  variant = 'primary',
  ...props
}) {
  const fabRef = useRef(null)

  useEffect(() => {
    const fab = fabRef.current
    if (!fab) return

    const handleClick = (e) => {
      if (onClick) {
        onClick(e)
      }
    }

    fab.addEventListener('click', handleClick)
    return () => fab.removeEventListener('click', handleClick)
  }, [onClick])

  return React.createElement(
    'md-fab',
    {
      ref: fabRef,
      variant,
      label,
      ...props
    },
    // Ícone como slot
    React.createElement('md-icon', { slot: 'icon' }, icon)
  )
}
