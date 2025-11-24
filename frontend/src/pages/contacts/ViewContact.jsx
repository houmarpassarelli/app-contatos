import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader } from '@googlemaps/js-api-loader'
import { useContacts } from '../../contexts/ContactsContext'
import Button from '../../components/md/Button'
import TextField from '../../components/md/TextField'
import Card from '../../components/md/Card'
import IconButton from '../../components/md/IconButton'
import Alert from '../../components/md/Alert'
import { maskCPF, maskPhone } from '../../utils/masks'

export default function ViewContact() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { fetchContact } = useContacts()
    const [contact, setContact] = useState(null)
    const [error, setError] = useState('')
    const mapRef = useRef(null)
    const googleMapRef = useRef(null)

    useEffect(() => {
        fetchContact(id)
            .then(data => {
                setContact(data)
            })
            .catch(() => {
                setError('Erro ao carregar contato.')
            })
    }, [id])

    useEffect(() => {
        if (contact && contact.latitude && contact.longitude && mapRef.current && !googleMapRef.current) {
            const initMap = async () => {
                const loader = new Loader({
                    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                    version: "weekly",
                })

                try {
                    const { Map } = await loader.importLibrary("maps")
                    const { Marker } = await loader.importLibrary("marker")

                    const position = {
                        lat: parseFloat(contact.latitude),
                        lng: parseFloat(contact.longitude)
                    }

                    const map = new Map(mapRef.current, {
                        center: position,
                        zoom: 15,
                        mapId: "DEMO_MAP_ID", // Map ID is required for AdvancedMarkerElement, but standard Marker works too
                    })

                    new Marker({
                        map: map,
                        position: position,
                        title: contact.name,
                    })

                    googleMapRef.current = map
                } catch (e) {
                    console.error("Erro ao carregar o mapa:", e)
                }
            }

            initMap()
        }
    }, [contact])

    if (!contact) {
        return (
            <div className="surface" style={{ minHeight: '100vh' }}>
                <div className="flex-center" style={{ height: '100vh' }}>
                    <div style={{ textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        Carregando...
                    </div>
                </div>
            </div>
        )
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
                        Detalhes do Contato
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="container" style={{ padding: '32px 16px', maxWidth: '900px' }}>
                <Card>
                    {/* Error Alert */}
                    <Alert severity="error">{error}</Alert>

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
                                value={contact.name}
                                readOnly
                            />
                            <TextField
                                label="CPF"
                                value={maskCPF(contact.cpf)}
                                readOnly
                            />
                            <TextField
                                label="Telefone"
                                value={maskPhone(contact.phone)}
                                readOnly
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
                                value={contact.zip_code}
                                readOnly
                            />
                            <TextField
                                label="Logradouro"
                                value={contact.street}
                                readOnly
                            />
                            <TextField
                                label="Número"
                                value={contact.number}
                                readOnly
                            />
                            <TextField
                                label="Complemento"
                                value={contact.complement || ''}
                                readOnly
                            />
                            <TextField
                                label="Bairro"
                                value={contact.neighborhood}
                                readOnly
                            />
                            <TextField
                                label="Cidade"
                                value={contact.city}
                                readOnly
                            />
                            <TextField
                                label="Estado"
                                value={contact.state}
                                readOnly
                                style={{ gridColumn: 'span 1' }}
                            />
                        </div>
                    </div>

                    {/* Map Section */}
                    {contact.latitude && contact.longitude && (
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '500',
                                color: 'var(--md-sys-color-on-surface)',
                                marginBottom: '16px'
                            }}>
                                Localização
                            </h2>
                            <div
                                ref={mapRef}
                                style={{
                                    width: '100%',
                                    height: '400px',
                                    borderRadius: 'var(--md-sys-shape-corner-medium)',
                                    overflow: 'hidden'
                                }}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                            Voltar
                        </Button>
                        <Button onClick={() => navigate(`/contacts/${id}/edit`)}>
                            Editar
                        </Button>
                    </div>
                </Card>
            </main>
        </div>
    )
}
