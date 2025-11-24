import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/md/Button'
import TextField from '../../components/md/TextField'
import Alert from '../../components/md/Alert'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Falha no login. Verifique suas credenciais.')
    }
  }

  return (
    <div className="flex-center surface" style={{ minHeight: '100vh', padding: '24px' }}>
      <div className="md-card" style={{ maxWidth: '900px', width: '100%', padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Form Container */}
          <div className="p-4" style={{ padding: '40px' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              {/* Título */}
              <h1 style={{
                fontSize: '32px',
                fontWeight: '400',
                marginBottom: '8px',
                color: 'var(--md-sys-color-on-surface)'
              }}>
                Bem-vindo de volta
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--md-sys-color-on-surface-variant)',
                marginBottom: '32px'
              }}>
                Entre com suas credenciais para continuar
              </p>

              {/* Error Alert */}
              {error && (
                <Alert severity="error">{error}</Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-col gap-3">
                <TextField
                  label="E-mail"
                  type="email"
                  required
                  value={form.email}
                  onChange={(value) => setForm({ ...form, email: value })}
                  supportingText="Digite seu endereço de e-mail"
                />

                <TextField
                  label="Senha"
                  type="password"
                  required
                  value={form.password}
                  onChange={(value) => setForm({ ...form, password: value })}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              {/* Divider */}
              <div style={{
                height: '1px',
                backgroundColor: 'var(--md-sys-color-outline-variant)',
                margin: '32px 0'
              }} />

              {/* Links */}
              <div className="flex-col gap-2" style={{ alignItems: 'center' }}>
                <Link to="/forgot-password" className="md-link" style={{ fontSize: '14px' }}>
                  Esqueceu sua senha?
                </Link>
                <p style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Não tem uma conta?{' '}
                  <Link to="/register" className="md-link">
                    Criar conta
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
