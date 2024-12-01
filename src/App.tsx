import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import DashboardPage from './pages/dashboard'
import ProfilePage from './pages/profile'
import ForgotPasswordPage from './pages/forgot-password'
import ResetPasswordPage from './pages/reset-password'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from 'next-themes'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App
