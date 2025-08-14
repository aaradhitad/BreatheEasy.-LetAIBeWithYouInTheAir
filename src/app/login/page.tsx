"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../auth-actions";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUser(data.emailOrUsername, data.password);
      
      if (result.success && result.user) {
        // Store user data in localStorage (without password)
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Background rectangle with text */}
      <div className="absolute left-32 top-1/2 transform -translate-y-1/2 w-96 h-64 bg-slate-600/30 rounded-lg flex items-center justify-center p-8 shadow-2xl shadow-cyan-500/20">
        <div className="text-center">
          <span className="font-raleway text-2xl text-slate-300">Let </span>
          <span className="font-montserrat text-6xl text-cyan-500">AI</span>
          <span className="font-raleway text-2xl text-slate-300"> be with you in the </span>
          <span className="font-montserrat text-6xl text-cyan-500">Air</span>
          <span className="font-raleway text-2xl text-slate-300">.</span>
        </div>
      </div>

      <div className="flex-1"></div>
      
      <div className="flex items-center justify-center w-full max-w-md p-8 mr-16">
        <Card className="w-full bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  {...register("emailOrUsername")}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.emailOrUsername && (
                  <p className="text-sm text-red-400">{errors.emailOrUsername.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
