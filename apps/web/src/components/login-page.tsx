import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password")
  const { login } = useData()

  const handleLogin = () => {
    login(email, password)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <CardTitle className="text-2xl">FieldService Admin</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground">
            Sign In
          </Button>

          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
            <p>
              <strong>Demo Admin:</strong> admin@example.com / password
            </p>
            <p>
              <strong>Demo Field Worker:</strong> fieldworker@example.com / password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
