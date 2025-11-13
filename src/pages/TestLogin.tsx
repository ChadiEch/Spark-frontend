import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "@/components/ui/use-toast"
import { debugAuthService } from "@/services/debugService"

export default function TestLogin() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState('admin@company.com')
  const [password, setPassword] = useState('AdminPass123!')
  const navigate = useNavigate()

  async function testDirectAPI() {
    setIsLoading(true)
    try {
      await debugAuthService.testDirectAPILogin(email, password)
      toast({
        title: "Success",
        description: "Direct API call completed. Check console for details.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "API call failed. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function testUserService() {
    setIsLoading(true)
    try {
      await debugAuthService.testUserServiceLogin(email, password)
      toast({
        title: "Success",
        description: "UserService call completed. Check console for details.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "UserService call failed. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function testAuthContext() {
    setIsLoading(true)
    try {
      console.log('=== Testing AuthContext Login ===')
      const { login } = await import('@/contexts/AuthContext')
      console.log('Imported login function')
      
      // This is a bit tricky since we can't directly call the hook outside of a component
      toast({
        title: "Info",
        description: "AuthContext test requires being inside a component. Use the main login page for this test.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "AuthContext test failed. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.crown className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Login Debug Test
          </h1>
          <p className="text-sm text-muted-foreground">
            Test different login methods to identify the issue
          </p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Debug Login</CardTitle>
            <CardDescription>
              Test different login methods
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect="off"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                disabled={isLoading} 
                onClick={testDirectAPI}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Test Direct API
              </Button>
              <Button 
                disabled={isLoading} 
                onClick={testUserService}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Test User Service
              </Button>
            </div>
            <Button 
              disabled={isLoading} 
              onClick={testAuthContext}
              className="w-full"
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Test Auth Context
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}