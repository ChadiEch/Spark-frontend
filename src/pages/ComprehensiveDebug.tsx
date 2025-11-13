import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "@/components/ui/use-toast"
import { comprehensiveDebugService } from "@/services/comprehensiveDebugService"

export default function ComprehensiveDebug() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState('admin@company.com')
  const [password, setPassword] = useState('AdminPass123!')
  const navigate = useNavigate()

  async function runComprehensiveTest() {
    setIsLoading(true)
    try {
      console.log('=== STARTING COMPREHENSIVE DEBUG TEST ===')
      const result = await comprehensiveDebugService.testCompleteLoginFlow(email, password)
      console.log('=== COMPREHENSIVE DEBUG TEST COMPLETE ===')
      console.log('Result:', result)
      
      toast({
        title: "Comprehensive Test Complete",
        description: "Check the browser console for detailed results.",
      })
    } catch (error: any) {
      console.log('=== COMPREHENSIVE DEBUG TEST ERROR ===')
      console.log('Error:', error)
      
      toast({
        title: "Test Failed",
        description: error.message || "Check console for details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function clearAuthData() {
    comprehensiveDebugService.clearAllAuthData()
    toast({
      title: "Auth Data Cleared",
      description: "All authentication data has been removed from localStorage.",
    })
  }

  function checkAuthState() {
    const state = comprehensiveDebugService.checkAuthState()
    toast({
      title: "Auth State Check",
      description: `Token: ${state.token ? 'Present' : 'Missing'}, User: ${state.currentUser ? 'Present' : 'Missing'}`,
    })
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.crown className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Comprehensive Debug
          </h1>
          <p className="text-sm text-muted-foreground">
            Detailed login process debugging
          </p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Debug Login Process</CardTitle>
            <CardDescription>
              Run comprehensive tests to identify login issues
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
            <Button 
              disabled={isLoading} 
              onClick={runComprehensiveTest}
              className="w-full"
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Run Comprehensive Test
            </Button>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                variant="outline"
                disabled={isLoading} 
                onClick={clearAuthData}
              >
                Clear Auth Data
              </Button>
              <Button 
                variant="outline"
                disabled={isLoading} 
                onClick={checkAuthState}
              >
                Check Auth State
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                variant="secondary"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/')}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}