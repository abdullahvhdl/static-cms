import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';
import { adminConfig } from '../config';

interface AdminAuthProps {
  children: React.ReactNode;
}

const AUTH_KEY = "cms_admin_authenticated";

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authData = sessionStorage.getItem(AUTH_KEY);
      if (authData) {
        const { timestamp } = JSON.parse(authData);
        const expiryTime = timestamp + (adminConfig.sessionTimeoutHours * 60 * 60 * 1000);
        
        if (Date.now() < expiryTime) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(AUTH_KEY);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      sessionStorage.removeItem(AUTH_KEY);
    }
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === adminConfig.password) {
      const authData = {
        timestamp: Date.now(),
        authenticated: true
      };
      
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      setPassword('');
      
      toast({
        title: "Success",
        description: "Successfully authenticated as admin"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid password. Please try again."
      });
      setPassword('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out from admin panel"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>
              Enter the admin password to access the CMS admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Authenticate
              </Button>
            </form>
            {adminConfig.showPasswordHint && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Demo Password:</strong> {adminConfig.password}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  In production, configure this password securely in config.ts and use HTTPS.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Authenticated as Admin
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs"
          >
            Logout
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
