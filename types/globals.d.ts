export {}

export type AppRole = 'teacher' | 'student'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: AppRole
    }
  }
}
