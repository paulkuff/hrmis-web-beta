import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type Profile, type ProfileUpdatePayload } from "@/lib/types"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        if (userError || !currentUser) {
          throw userError || new Error('User not found')
        }
        setUser(currentUser)

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (profileData) {
          setProfile(profileData)
          setAvatarUrl(profileData.avatar_url)
        }
      } catch (error) {
        console.error('Error:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [navigate])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (!profile) return

      const updates: Partial<Profile> = {
        avatar_url: filePath,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(data.publicUrl)
      toast.success('Avatar updated successfully!')
    } catch (error) {
      toast.error('Error uploading avatar!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!user?.id || !profile) return

      const updates: Partial<Profile> = {
        full_name: profile.full_name,
        birthday: profile.birthday,
        age: profile.age,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      if (updatedProfile) {
        setProfile(updatedProfile)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    }
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar>
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="avatar"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    Change Avatar
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev!, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={profile?.birthday || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev!, birthday: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile?.age || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Age is automatically calculated from birthday
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
