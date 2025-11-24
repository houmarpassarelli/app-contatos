import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContacts } from '../../contexts/ContactsContext'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/md/Button'
import TextField from '../../components/md/TextField'
import Card from '../../components/md/Card'
import IconButton from '../../components/md/IconButton'

export default function Dashboard() {
  const navigate = useNavigate()
  const { contacts, pagination, loading, fetchContacts, deleteContact } = useContacts()
  const { logout } = useAuth()
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadPage(1)
  }, [])

  async function loadPage(page) {
    await fetchContacts({ page, search })
  }

  async function handleDelete(contact) {
    if (confirm(`Excluir ${contact.name}?`)) {
      await deleteContact(contact.id)
      loadPage(pagination.current_page)
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
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: 'var(--md-sys-color-on-surface)',
            margin: 0
          }}>
            UEX Contatos
          </h1>
          <Button variant="outlined" onClick={() => logout().then(() => navigate('/login'))}>
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '32px 16px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '400',
              color: 'var(--md-sys-color-on-surface)',
              margin: '0 0 4px 0'
            }}>
              Meus Contatos
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--md-sys-color-on-surface-variant)',
              margin: 0
            }}>
              {pagination?.total || 0} contato(s) encontrado(s)
            </p>
          </div>
          <Button onClick={() => navigate('/contacts/create')}>
            + Novo Contato
          </Button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '24px', maxWidth: '600px' }}>
          <TextField
            label="Buscar contatos"
            value={search}
            onChange={(value) => {
              setSearch(value)
              loadPage(1)
            }}
            supportingText="Busque por nome, CPF ou telefone"
          />
        </div>

        {/* Contacts Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Carregando...
          </div>
        ) : contacts.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontSize: '16px', color: 'var(--md-sys-color-on-surface-variant)', margin: '0 0 16px 0' }}>
              Nenhum contato encontrado
            </p>
            <Button onClick={() => navigate('/contacts/create')}>
              Criar Primeiro Contato
            </Button>
          </Card>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {contacts.map(contact => (
                <Card key={contact.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Contact Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: 'var(--md-sys-color-on-surface)',
                        margin: '0 0 4px 0'
                      }}>
                        {contact.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        margin: 0
                      }}>
                        CPF: {contact.cpf}
                      </p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>📞</span>
                      <span style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface)' }}>{contact.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface-variant)' }}>📍</span>
                      <span style={{ fontSize: '14px', color: 'var(--md-sys-color-on-surface)' }}>{contact.city}/{contact.state}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <Button variant="text" onClick={() => navigate(`/contacts/${contact.id}/view`)}>
                      Exibir
                    </Button>
                    <Button variant="text" onClick={() => navigate(`/contacts/${contact.id}/edit`)}>
                      Editar
                    </Button>
                    <Button variant="text" onClick={() => handleDelete(contact)} style={{ color: 'var(--md-sys-color-error)' }}>
                      Excluir
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '32px',
                padding: '16px 0'
              }}>
                <IconButton
                  onClick={() => loadPage(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                >
                  chevron_left
                </IconButton>
                <span style={{
                  fontSize: '14px',
                  color: 'var(--md-sys-color-on-surface)',
                  padding: '0 16px'
                }}>
                  Página {pagination.current_page} de {pagination.last_page}
                </span>
                <IconButton
                  onClick={() => loadPage(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  chevron_right
                </IconButton>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
