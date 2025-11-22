'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const MOCK_CREDENTIALS = {
  user: { email: 'user@test.com', password: 'pass123' },
  admin: { email: 'admin@test.com', password: 'pass123' },
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Check credentials
    let userRole = null
    if (email === MOCK_CREDENTIALS.user.email && password === MOCK_CREDENTIALS.user.password) {
      userRole = 'user'
    } else if (email === MOCK_CREDENTIALS.admin.email && password === MOCK_CREDENTIALS.admin.password) {
      userRole = 'admin'
    } else {
      setError('Invalid credentials. Try user@test.com or admin@test.com with pass123')
      setIsLoading(false)
      return
    }

    // Store user
    localStorage.setItem('user', JSON.stringify({ email, role: userRole }))
    
    // Redirect
    if (userRole === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Card className="w-full max-w-md p-6 border-2 border-black">
        <h1 className="text-2xl font-bold text-black mb-2">Service Maintenance</h1>
        <p className="text-sm text-gray-600 mb-6">Progressive Web App</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@test.com"
              className="border-2 border-black text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="pass123"
              className="border-2 border-black text-black"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-black text-xs text-gray-600 space-y-2">
          <p><strong>User:</strong> user@test.com / pass123</p>
          <p><strong>Admin:</strong> admin@test.com / pass123</p>
        </div>
      </Card>
    </div>
  )
}
