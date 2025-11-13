import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "@/components/ui/use-toast"
// Import our user service
import { userService } from "@/services/dataService"

export default function Register() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  // Refs for keyboard navigation
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  // Real-time validation
  useEffect(() => {
    if (name && name.length < 2) {
      setNameError('Name must be at least 2 characters')
    } else if (!name) {
      setNameError('Name is required')
    } else {
      setNameError(null)
    }
  }, [name])

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
    if (password && password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
    } else if (password && !/[A-Z]/.test(password)) {
      setPasswordError('Password must include an uppercase letter')
    } else if (password && !/[a-z]/.test(password)) {
      setPasswordError('Password must include a lowercase letter')
    } else if (password && !/[0-9]/.test(password)) {
      setPasswordError('Password must include a number')
    } else if (password && !/[^A-Za-z0-9]/.test(password)) {
      setPasswordError('Password must include a special character')
    } else if (!password) {
      setPasswordError('Password is required')
    } else {
      setPasswordError(null)
    }
  }, [password])

  useEffect(() => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError(null)
    }
  }, [confirmPassword, password])

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Basic validation
      if (!email || !password || !confirmPassword || !name) {
        throw new Error('Please fill in all fields')
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Password strength validation
      if (passwordStrength < 4) {
        throw new Error('Password is too weak. It should be at least 8 characters long and include uppercase, lowercase, number, and special character.')
      }

      // Register user
      const newUser = await userService.register({
        email,
        name,
        password, // Pass the actual password
        role: 'ADMIN', // Default role for new users - changed to ADMIN for testing
      })

      if (newUser) {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        } else {
          localStorage.removeItem('rememberMe')
        }

        // Successful registration
        toast({
          title: "Registration Successful",
          description: "Welcome! Your account has been created successfully.",
        })
        navigate('/')
      } else {
        throw new Error('Failed to create account')
      }
    } catch (error: any) {
      // Provide more specific error messages based on error type
      let errorMessage = error.message || "An error occurred during registration. Please try again.";
      
      // Check for specific error conditions
      if (error.message && error.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use a different email or sign in instead.';
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid registration data. Please check your information and try again.';
      } else if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please use a different email or sign in instead.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast({
        title: "Registration Failed",
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
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to create your account
          </p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  ref={nameRef}
                  onKeyDown={(e) => handleKeyDown(e, emailRef)}
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p id="name-error" className="text-sm font-medium text-destructive">
                    {nameError}
                  </p>
                )}
              </div>
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
                  autoComplete="new-password"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={password}
                  onChange={handlePasswordChange}
                  ref={passwordRef}
                  onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${{
                        0: 'bg-gray-200',
                        1: 'bg-red-500',
                        2: 'bg-red-500',
                        3: 'bg-yellow-500',
                        4: 'bg-green-500',
                        5: 'bg-green-500'
                      }[passwordStrength] || 'bg-gray-200'}`} 
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {passwordStrength > 0 && (
                      {
                        1: 'Weak',
                        2: 'Weak',
                        3: 'Medium',
                        4: 'Strong',
                        5: 'Strong'
                      }[passwordStrength]
                    )}
                  </span>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-sm font-medium text-destructive">
                    {passwordError}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  placeholder="••••••••"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  ref={confirmPasswordRef}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      submitRef.current?.click()
                    }
                  }}
                  aria-invalid={!!confirmPasswordError}
                  aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
                />
                {confirmPasswordError && (
                  <p id="confirm-password-error" className="text-sm font-medium text-destructive">
                    {confirmPasswordError}
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
                disabled={isLoading || !!emailError || !!passwordError || !!confirmPasswordError || !!nameError} 
                className="w-full"
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign Up
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="hover:text-brand underline underline-offset-4"
          >
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}