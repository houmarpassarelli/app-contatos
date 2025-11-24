import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ContactsProvider } from './contexts/ContactsContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/contacts/Dashboard'
import CreateContact from './pages/contacts/CreateContact'

import EditContact from './pages/contacts/EditContact'
import ViewContact from './pages/contacts/ViewContact'
import NotFound from './pages/NotFound'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/reset" element={<GuestRoute><ResetPassword /></GuestRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/contacts/create" element={<PrivateRoute><CreateContact /></PrivateRoute>} />
      <Route path="/contacts/:id/edit" element={<PrivateRoute><EditContact /></PrivateRoute>} />
      <Route path="/contacts/:id/view" element={<PrivateRoute><ViewContact /></PrivateRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContactsProvider>
          <AppRoutes />
        </ContactsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
