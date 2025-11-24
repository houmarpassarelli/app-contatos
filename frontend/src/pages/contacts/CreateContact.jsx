import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContacts } from '../../contexts/ContactsContext'
import Button from '../../components/md/Button'
import TextField from '../../components/md/TextField'
import Card from '../../components/md/Card'
import IconButton from '../../components/md/IconButton'
import Alert from '../../components/md/Alert'
import { unmask, maskCPF, maskPhone } from '../../utils/masks'
import { fetchAddressByCEP } from '../../services/viacep'

export default function CreateContact() {
  const navigate = useNavigate()
  const { createContact } = useContacts()
  const [form, setForm] = useState({
    name: '', cpf: '', phone: '', street: '', number: '',
    complement: '', neighborhood: '', city: '', state: '', zip_code: ''
  })
  const [displayForm, setDisplayForm] = useState({
    cpf: '', phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loadingCEP, setLoadingCEP] = useState(false)

  const cpfRef = useRef(null)
  const phoneRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createContact(form)
      navigate('/dashboard')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Erro ao criar contato. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const update = (field, value) => setForm({ ...form, [field]: value })

  // Handler para CPF com máscara
  function handleCPFChange(value) {
    const unmasked = unmask(value)
    const masked = maskCPF(unmasked)

    if (masked === displayForm.cpf && cpfRef.current) {
      cpfRef.current.value = masked
    }

    setDisplayForm(prev => ({ ...prev, cpf: masked }))
    update('cpf', unmasked.slice(0, 11))
  }

  // Handler para telefone com máscara
  function handlePhoneChange(value) {
    const unmasked = unmask(value)
    const masked = maskPhone(unmasked)

    if (masked === displayForm.phone && phoneRef.current) {
      phoneRef.current.value = masked
    }

    setDisplayForm(prev => ({ ...prev, phone: masked }))
    update('phone', unmasked.slice(0, 11))
  }

  // Handler para CEP - busca automática ao completar 8 dígitos
  async function handleCEPChange(value) {
    const unmasked = unmask(value)

    // Limita a 8 dígitos
    if (unmasked.length <= 8) {
      update('zip_code', unmasked)

      // Busca endereço quando atingir 8 dígitos
      if (unmasked.length === 8) {
        setLoadingCEP(true)
        setError('')
        try {
          const address = await fetchAddressByCEP(unmasked)
          setForm({
            ...form,
            zip_code: unmasked,
            street: address.street,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
          })
        } catch (err) {
          setError(`CEP: ${err.message}`)
        } finally {
          setLoadingCEP(false)
        }
      }
    }
  }

  return (
    <div className="surface" style={{ minHeight: '100vh' }}>
      {/* Top App Bar */}
      <header style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <IconButton onClick={() => navigate('/dashboard')}>
            arrow_back
          </IconButton>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: 'var(--md-sys-color-on-surface)',
            margin: 0
          }}>
            Novo Contato
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '32px 16px', maxWidth: '900px' }}>
        <Card>
          {/* Error Alert */}
          <Alert severity="error">{error}</Alert>

          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '16px'
              }}>
                Informações Pessoais
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <TextField
                  label="Nome completo"
                  value={form.name}
                  onChange={(value) => update('name', value)}
                  required
                  supportingText="Nome completo do contato"
                />
                <TextField
                  ref={cpfRef}
                  label="CPF"
                  value={displayForm.cpf}
                  onChange={handleCPFChange}
                  required
                  maxLength={14}
                  supportingText="000.000.000-00"
                />
                <TextField
                  ref={phoneRef}
                  label="Telefone"
                  value={displayForm.phone}
                  onChange={handlePhoneChange}
                  required
                  type="tel"
                  maxLength={15}
                  supportingText="(00) 00000-0000"
                />
              </div>
            </div>

            {/* Address Section */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '16px'
              }}>
                Endereço
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <TextField
                  label="CEP"
                  value={form.zip_code}
                  onChange={handleCEPChange}
                  required
                  type="text"
                  supportingText={loadingCEP ? "Buscando endereço..." : "8 dígitos (apenas números)"}
                />
                <TextField
                  label="Logradouro"
                  value={form.street}
                  onChange={(value) => update('street', value)}
                  required
                  supportingText="Rua, Avenida, etc."
                />
                <TextField
                  label="Número"
                  value={form.number}
                  onChange={(value) => update('number', value)}
                  required
                />
                <TextField
                  label="Complemento"
                  value={form.complement}
                  onChange={(value) => update('complement', value)}
                  supportingText="Apto, Bloco, etc. (opcional)"
                />
                <TextField
                  label="Bairro"
                  value={form.neighborhood}
                  onChange={(value) => update('neighborhood', value)}
                  required
                />
                <TextField
                  label="Cidade"
                  value={form.city}
                  onChange={(value) => update('city', value)}
                  required
                />
                <TextField
                  label="Estado"
                  value={form.state}
                  onChange={(value) => update('state', value.toUpperCase())}
                  required
                  supportingText="UF (2 letras)"
                  style={{ gridColumn: 'span 1' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
              <Button variant="outlined" onClick={() => navigate('/dashboard')} type="button" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Contato'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
