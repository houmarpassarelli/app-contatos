/**
 * Card component - Material Design 3
 * Superficie elevada para agrupar conteúdo relacionado
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do card
 * @param {string} props.className - Classes CSS adicionais
 * @param {Object} props.style - Estilos inline
 */
export default function Card({ children, className = '', style = {}, ...props }) {
  const cardStyle = {
    backgroundColor: 'var(--md-sys-color-surface)',
    color: 'var(--md-sys-color-on-surface)',
    borderRadius: 'var(--md-sys-shape-corner-medium)',
    padding: '16px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
    transition: 'box-shadow 0.2s',
    ...style
  }

  return (
    <div className={`md-card ${className}`} style={cardStyle} {...props}>
      {children}
    </div>
  )
}
