import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const ContactsContext = createContext()

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState([])
  const [currentContact, setCurrentContact] = useState(null)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [loading, setLoading] = useState(false)

  async function fetchContacts(params = {}) {
    setLoading(true)
    try {
      const { data } = await api.get('/contacts', { params })
      setContacts(data.data)
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total
      })
      return data
    } finally {
      setLoading(false)
    }
  }

  async function fetchContact(id) {
    setLoading(true)
    try {
      const { data } = await api.get(`/contacts/${id}`)
      setCurrentContact(data.contact)
      return data.contact
    } finally {
      setLoading(false)
    }
  }

  async function createContact(contactData) {
    setLoading(true)
    try {
      const { data } = await api.post('/contacts', contactData)
      setContacts([data.contact, ...contacts])
      return data.contact
    } finally {
      setLoading(false)
    }
  }

  async function updateContact(id, contactData) {
    setLoading(true)
    try {
      const { data } = await api.put(`/contacts/${id}`, contactData)
      setContacts(contacts.map(c => c.id === id ? data.contact : c))
      setCurrentContact(data.contact)
      return data.contact
    } finally {
      setLoading(false)
    }
  }

  async function deleteContact(id) {
    setLoading(true)
    try {
      await api.delete(`/contacts/${id}`)
      setContacts(contacts.filter(c => c.id !== id))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ContactsContext.Provider value={{
      contacts, currentContact, pagination, loading,
      fetchContacts, fetchContact, createContact, updateContact, deleteContact
    }}>
      {children}
    </ContactsContext.Provider>
  )
}

export function useContacts() {
  return useContext(ContactsContext)
}
