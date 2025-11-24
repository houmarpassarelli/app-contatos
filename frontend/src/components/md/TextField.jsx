import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import '@material/web/textfield/filled-text-field.js'
import '@material/web/textfield/outlined-text-field.js'

/**
 * Wrapper React para Material Design 3 Text Field
 *
 * @param {Object} props
 * @param {'filled'|'outlined'} props.variant - Variante do campo
 * @param {string} props.label - Label do campo
 * @param {string} props.value - Valor do campo
 * @param {Function} props.onChange - Callback de mudança
 * @param {string} props.type - Tipo do input (text, email, password, etc)
 * @param {boolean} props.required - Se o campo é obrigatório
 * @param {boolean} props.disabled - Se o campo está desabilitado
 * @param {string} props.error - Mensagem de erro
 * @param {string} props.supportingText - Texto de suporte
 * @param {React.Ref} ref - Ref para o elemento DOM
 */
const TextField = forwardRef(({
  variant = 'filled',
  label,
  value = '',
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  supportingText,
  ...props
}, ref) => {
  const textFieldRef = useRef(null)

  useImperativeHandle(ref, () => textFieldRef.current)

  useEffect(() => {
    const textField = textFieldRef.current
    if (!textField) return

    const handleInput = (e) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    textField.addEventListener('input', handleInput)
    return () => textField.removeEventListener('input', handleInput)
  }, [onChange])

  // Sincronizar valor quando mudado externamente (ex: reset de form)
  useEffect(() => {
    const textField = textFieldRef.current
    if (textField && textField.value !== value) {
      textField.value = value
    }
  }, [value])

  // Sincronizar propriedades booleanas via ref (React 18 não suporta propriedades em Web Components)
  useEffect(() => {
    const textField = textFieldRef.current
    if (!textField) return

    textField.required = required
    textField.disabled = disabled
    textField.error = !!error
  }, [required, disabled, error])

  const tagName = `md-${variant}-text-field`

  return React.createElement(tagName, {
    ref: textFieldRef,
    label,
    type,
    'error-text': error,
    'supporting-text': supportingText || error,
    ...props
  })
})

export default TextField
