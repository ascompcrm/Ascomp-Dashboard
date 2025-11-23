'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const { login } = useAuth()
  const router = useRouter()

  const validateEmail = (emailValue: string): string => {
    if (!emailValue.trim()) {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const validatePassword = (passwordValue: string): string => {
    if (!passwordValue) {
      return 'Password is required'
    }
    if (passwordValue.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return ''
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched.email) {
      setEmailError(validateEmail(value))
    }
    if (error) setError('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (touched.password) {
      setPasswordError(validatePassword(value))
    }
    if (error) setError('')
  }

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }))
    setEmailError(validateEmail(email))
  }

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }))
    setPasswordError(validatePassword(password))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTouched({ email: true, password: true })
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(passwordErr)
    if (emailErr || passwordErr) {
      return
    }
    setIsLoading(true)
    
    try {
      await login(email, password)
      // Redirect is handled in auth context
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <Card className="border-2 border-black shadow-lg">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] h-16 sm:h-24 md:h-28 relative bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/LOGO/Ascomp.png"
                  alt="Company Logo"
                  fill
                  className="object-contain p-3sm:p-4"
                  priority
                />
              </div>
            </div>
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2">
                Login
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Sign in to access your account
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="Enter your email"
                  className={`border-2 w-full text-black transition-colors ${
                    emailError && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : touched.email && !emailError && email
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-black focus:border-black'
                  }`}
                />
                {emailError && touched.email && (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="Enter your password"
                  className={`border-2 w-full text-black transition-colors ${
                    passwordError && touched.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : touched.password && !passwordError && password
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-black focus:border-black'
                  }`}
                />
                {passwordError && touched.password && (
                  <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                )}
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading || !!emailError || !!passwordError}
                className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black font-bold py-5 sm:py-6 text-base sm:text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            {/* <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-2">
                Test Credentials
              </p>
              <div className="text-xs text-gray-600 space-y-1 text-center">
                <p><strong>User:</strong> user@test.com / pass123</p>
                <p><strong>Admin:</strong> admin@test.com / pass123</p>
              </div>
            </div> */}
          </div>
        </Card>
      </div>
    </div>
  )
}
