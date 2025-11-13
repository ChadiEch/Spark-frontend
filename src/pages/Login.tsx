import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "@/components/ui/use-toast"
// Import our useAuth hook
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()
  
  // Refs for keyboard navigation
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  // Check if user previously selected "Remember Me"
  useEffect(() => {
    const rememberMeStored = localStorage.getItem('rememberMe') === 'true'
    setRememberMe(rememberMeStored)
  }, [])

  // Real-time validation
  useEffect(() => {
    if (email && !email.includes('@')) {
      setEmailError('Please enter a valid email address')
    } else if (!email) {
      setEmailError('Email is required')
    } else {
      setEmailError(null)
    }
  }, [email])

  useEffect(() => {
    if (password && password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
    } else if (!password) {
      setPasswordError('Password is required')
    } else {
      setPasswordError(null)
    }
  }, [password])

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setApiError(null)

    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Please fill in all fields')
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      console.log('Attempting login with:', { email, password });

      // Authenticate user using the login function from AuthContext
      const user = await login(email, password)
      
      console.log('Login response:', user);
      
      if (user) {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        } else {
          localStorage.removeItem('rememberMe')
        }

        // Successful login
        toast({
          title: "Login Successful",
          description: "Welcome back! You have been successfully logged in.",
        })
        navigate('/');
      } else {
        throw new Error('Login failed. Please check your credentials.')
      }
    } catch (error: any) {
      console.error('Login error caught in component:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = error.message || "An error occurred during login. Please try again.";
      
      // Check for specific error conditions
      if (error.message && error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please check your email and password.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to access this account.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setApiError(errorMessage);
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle key down events for keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLInputElement | HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      nextRef.current?.focus()
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.crown className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="grid gap-4">
              {apiError && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {apiError}
                </div>
              )}
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
                  ref={emailRef}
                  onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <p id="email-error" className="text-sm font-medium text-destructive">
                    {emailError}
                  </p>
                )}
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
                  ref={passwordRef}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      submitRef.current?.click()
                    }
                  }}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                {passwordError && (
                  <p id="password-error" className="text-sm font-medium text-destructive">
                    {passwordError}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="rememberMe">Remember me</Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                ref={submitRef}
                disabled={isLoading || !!emailError || !!passwordError} 
                className="w-full"
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
              {isLoading && (
                <p className="text-sm text-muted-foreground mt-2">
                  Authenticating...
                </p>
              )}
            </CardFooter>
          </form>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            to="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            Don't have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}