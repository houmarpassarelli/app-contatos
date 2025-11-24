import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Button from '../../components/md/Button'
import TextField from '../../components/md/TextField'
import Alert from '../../components/md/Alert'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess('Link de recuperação enviado para seu e-mail!')
      setError('')
    } catch (err) {
      setError(err.response?.data || 'Erro ao enviar link. Verifique o e-mail e tente novamente.')
      setSuccess('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-center surface" style={{ minHeight: '100vh', padding: '24px' }}>
      <div className="md-card" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {/* Título */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '400',
            marginBottom: '8px',
            color: 'var(--md-sys-color-on-surface)'
          }}>
            Recuperar Senha
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: '32px'
          }}>
            Digite seu e-mail para receber o link de recuperação
          </p>

          {/* Success Alert */}
          <Alert severity="success">{success}</Alert>

          {/* Error Alert */}
          <Alert severity="error">{error}</Alert>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-col gap-3">
            <TextField
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(value) => setEmail(value)}
              supportingText="Digite o e-mail cadastrado"
            />

            <Button
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Enviando...' : 'Enviar Link'}
            </Button>
          </form>

          {/* Links */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/login" className="md-link" style={{ fontSize: '14px' }}>
              ← Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
