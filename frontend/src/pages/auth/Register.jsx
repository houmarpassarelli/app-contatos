import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/md/Button'
import TextField from '../../components/md/TextField'
import Alert from '../../components/md/Alert'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="flex-center surface" style={{ minHeight: '100vh', padding: '24px' }}>
      <div className="md-card" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {/* Título */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '400',
            marginBottom: '8px',
            color: 'var(--md-sys-color-on-surface)'
          }}>
            Criar Conta
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: '32px'
          }}>
            Preencha os dados para criar sua conta
          </p>

          {/* Error Alert */}
          <Alert severity="error">{error}</Alert>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-col gap-3">
            <TextField
              label="Nome completo"
              type="text"
              required
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />

            <TextField
              label="E-mail"
              type="email"
              required
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
            />

            <TextField
              label="Senha"
              type="password"
              required
              value={form.password}
              onChange={(value) => setForm({ ...form, password: value })}
              supportingText="Mínimo 8 caracteres"
            />

            <TextField
              label="Confirmar senha"
              type="password"
              required
              value={form.password_confirmation}
              onChange={(value) => setForm({ ...form, password_confirmation: value })}
            />

            <Button
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Links */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Já tem uma conta?{' '}
              <Link to="/login" className="md-link">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
