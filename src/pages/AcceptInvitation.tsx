import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import api from '@/services/apiService';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitationData, setInvitationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const token = searchParams.get('token');

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        toast({
          title: "Error",
          description: "Invalid invitation link",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      try {
        const response = await api.get(`/invitations/${token}`);
        if (response.data.success) {
          setInvitationData(response.data.data);
          setLoginData(prev => ({ ...prev, email: response.data.data.email }));
        } else {
          throw new Error(response.data.message || 'Invalid invitation');
        }
      } catch (error: any) {
        console.error('Error fetching invitation:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Invalid or expired invitation",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, navigate]);

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setAccepting(true);
    try {
      // Try to login with provided credentials
      const response = await api.post('/auth/login', {
        email: loginData.email,
        password: loginData.password
      });

      if (response.data.success) {
        // Login successful, redirect to dashboard or home
        toast({
          title: "Success",
          description: "Login successful!",
        });
        navigate('/');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setAccepting(true);
    try {
      const response = await api.post(`/invitations/${token}/accept`, {
        name: formData.name,
        password: formData.password
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Account created successfully. You can now log in.",
        });
        // Redirect to login page with success message
        navigate('/login', { 
          state: { 
            message: "Account created successfully. Please log in with your new credentials." 
          } 
        });
      } else {
        throw new Error(response.data.message || 'Failed to accept invitation');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Accept Invitation</h1>
          <p className="text-muted-foreground mt-2">
            You've been invited to join Winnerforce Spark as a {invitationData?.role?.toLowerCase() || 'team member'}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Email:</strong> {invitationData?.email}
          </p>
          <p className="text-sm text-blue-800 mt-1">
            <strong>Invited by:</strong> {invitationData?.invitedBy || 'Administrator'}
          </p>
          <p className="text-sm text-blue-800 mt-1">
            <strong>Expires:</strong> {invitationData?.expiresAt ? new Date(invitationData.expiresAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="flex mb-6">
          <Button 
            variant={!hasAccount ? "default" : "outline"} 
            className="flex-1 mr-2"
            onClick={() => setHasAccount(false)}
          >
            Create Account
          </Button>
          <Button 
            variant={hasAccount ? "default" : "outline"} 
            className="flex-1 ml-2"
            onClick={() => setHasAccount(true)}
          >
            I Have an Account
          </Button>
        </div>

        {hasAccount ? (
          // Login Form
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginEmail">Email</Label>
              <Input
                id="loginEmail"
                type="email"
                value={loginData.email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loginPassword">Password</Label>
              <Input
                id="loginPassword"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "loginPassword-error" : undefined}
              />
              {errors.password && (
                <p id="loginPassword-error" className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={accepting}>
              {accepting ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={() => setHasAccount(false)} 
                className="text-sm"
              >
                Create a new account instead
              </Button>
            </div>
          </form>
        ) : (
          // Registration Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={accepting}>
              {accepting ? 'Accepting Invitation...' : 'Accept Invitation'}
            </Button>
            
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={() => setHasAccount(true)} 
                className="text-sm"
              >
                I already have an account
              </Button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <Button variant="link" onClick={() => navigate('/login')} className="text-sm">
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AcceptInvitation;