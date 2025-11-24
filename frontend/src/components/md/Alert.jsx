import React from 'react'
import Icon from './Icon'

/**
 * Componente de Alerta para exibir mensagens de sucesso ou erro
 * 
 * @param {Object} props
 * @param {'error'|'success'|'info'|'warning'} props.severity - Tipo do alerta
 * @param {string|Object} props.children - Mensagem ou objeto de erro
 * @param {string} props.title - Título opcional
 */
export default function Alert({ severity = 'error', children, title }) {
    if (!children) return null

    // Cores baseadas no Material Design 3
    const colors = {
        error: {
            bg: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
            icon: 'error'
        },
        success: {
            bg: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-on-primary-container)',
            icon: 'check_circle'
        },
        info: {
            bg: 'var(--md-sys-color-secondary-container)',
            color: 'var(--md-sys-color-on-secondary-container)',
            icon: 'info'
        },
        warning: {
            bg: 'var(--md-sys-color-tertiary-container)',
            color: 'var(--md-sys-color-on-tertiary-container)',
            icon: 'warning'
        }
    }

    const style = colors[severity] || colors.error

    // Processamento da mensagem de erro
    let content = []

    if (typeof children === 'string') {
        content.push(children)
    } else if (typeof children === 'object') {
        // Caso seja um objeto de resposta de erro do Laravel
        if (children.message) {
            content.push(children.message)
        }

        // Processa o objeto 'errors' se existir
        if (children.errors) {
            Object.values(children.errors).forEach(messages => {
                if (Array.isArray(messages)) {
                    messages.forEach(msg => content.push(msg))
                } else if (typeof messages === 'string') {
                    content.push(messages)
                }
            })
        }
    }

    // Remove duplicatas
    content = [...new Set(content)]

    if (content.length === 0) return null

    return (
        <div style={{
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: style.bg,
            color: style.color,
            borderRadius: 'var(--md-sys-shape-corner-small)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
        }}>
            <Icon>{style.icon}</Icon>
            <div style={{ flex: 1 }}>
                {title && (
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {title}
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {content.map((msg, index) => (
                        <div key={index}>{msg}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}
