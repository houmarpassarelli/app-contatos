/**
 * Material Design 3 Icon Component
 * Usa Material Symbols Outlined
 *
 * @param {Object} props
 * @param {string} props.children - Nome do ícone (ex: 'arrow_back', 'home', 'person')
 * @param {number} props.size - Tamanho do ícone (padrão: 24)
 * @param {string} props.className - Classes CSS adicionais
 */
export default function Icon({ children, size = 24, className = '', style = {}, ...props }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  )
}
