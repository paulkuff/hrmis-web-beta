export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  birthday: string | null
  age: number | null
  updated_at: string
  created_at?: string
}

export interface ProfileUpdatePayload {
  full_name?: string | null
  avatar_url?: string | null
  birthday?: string | null
  age?: number | null
  updated_at: string
}
