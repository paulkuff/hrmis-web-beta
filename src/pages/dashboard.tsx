import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { ChangePasswordForm } from '../components/change-password-form'
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"

interface Profile {
  id: string
  full_name: string
  updated_at: string
  age: number
  birthday: string
  avatar_url: string | null
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      setUser(user)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(profile)
        if (profile.avatar_url) {
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(profile.avatar_url)
          setAvatarUrl(data.publicUrl)
        }
      }
      setLoading(false)
    }

    checkUser()
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-medium flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <span>{profile?.full_name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <div className="text-lg">{profile?.full_name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="text-lg">{user?.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Birthday</label>
                <div className="text-lg">
                  {profile?.birthday 
                    ? new Date(profile.birthday).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Not set'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <div className="text-lg">{profile?.age || 'Not set'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="text-sm">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Your account statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <div className="text-lg">
                  {new Date(user?.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Status</label>
                <div className="text-lg">
                  {user?.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <div className="md:col-span-2">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
