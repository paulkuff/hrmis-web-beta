import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { supabase } from '../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Show message passed from registration page
    if (location.state?.message) {
      setMessage(location.state.message)
    }
  }, [location])

  const createProfile = async (userId: string, userData: any) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: userData.user_metadata.full_name,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error creating profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in.')
        } else {
          setError(error.message)
        }
      } else if (data?.user) {
        // Create profile if it doesn't exist
        await createProfile(data.user.id, data.user)
        // Redirect to dashboard after successful login
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded">
                {message}
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-sm text-center">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
