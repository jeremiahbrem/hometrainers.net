export type Profile = {
  email: string
  name: string
  type: 'client' | 'trainer'
  cities: string[]
  goals: string[]
  image: string
}