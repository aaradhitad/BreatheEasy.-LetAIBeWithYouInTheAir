"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const storedUser = localStorage.getItem('breatheEasyUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      // Handle migration for existing users who don't have username
      if (!user.username) {
        const generatedUsername = user.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const updatedUser = { ...user, username: generatedUsername };
        localStorage.setItem('breatheEasyUser', JSON.stringify(updatedUser));
      }
      
      // Allow login with either username or email
      if ((user.username === usernameOrEmail || user.email === usernameOrEmail) && user.password === password) {
        router.push('/dashboard');
      } else {
        setError('Invalid username/email or password.');
      }
    } else {
      setError('No user found. Please sign up.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white" style={{backgroundImage: "url('/background-hero.svg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="flex-1"></div>
      <div className="flex items-center justify-center w-full max-w-md p-8 mr-16">
        <Card className="w-full bg-slate-900/80 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Login</CardTitle>
          <CardDescription className="text-slate-400">Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-500/20 border-red-500 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail">Username or Email</Label>
            <Input 
              id="usernameOrEmail" 
              type="text" 
              placeholder="Enter username or email" 
              value={usernameOrEmail} 
              onChange={(e) => setUsernameOrEmail(e.target.value)} 
              className="bg-slate-800 border-slate-700" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-800 border-slate-700" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white rounded-lg">
            Login
          </Button>
          <p className="text-sm text-center text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
        </Card>
      </div>
    </div>
  );
}
