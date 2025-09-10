export interface TopicOption {
  id: any
  label: string
  votes?: number
}

export interface Topic {
  id: any
  title: string
  description?: string
  category?: string | null
  user?: { name?: string; icon?: string | null } | null
  options?: TopicOption[]
  totalVotes?: number
  createdAt?: string
  expiresAt?: string
  hasVoted?: boolean
  userVote?: number
  images?: string[]
}

export interface User {
  id: any
  name: string
  iconUrl?: string | null
  isLoggedIn?: boolean
}
