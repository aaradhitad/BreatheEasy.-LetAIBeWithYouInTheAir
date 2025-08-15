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
import { registerUser } from "../auth-actions";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await registerUser(data.username, data.email, data.password);
      
      if (result.success) {
        setSuccess(result.message);
        reset();
        
        // Redirect to login after successful signup
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Futuristic Background with Vertical Light Beam */}
      <div className="absolute inset-0">
        {/* Dark background with subtle warm glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"></div>
        
        {/* Vertical Light Beam */}
        <div className="absolute left-1/3 top-0 w-1 h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500 via-red-500 to-orange-600 opacity-80 blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-red-400 to-orange-500 opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-orange-300 via-red-300 to-orange-400 opacity-40 w-2"></div>
        </div>
        
        {/* Subtle purple accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {/* Text Content - Left Side */}
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 max-w-md">
          <div className="text-left space-y-2">
            <h1 className="text-4xl font-bold text-gray-200 leading-tight">
              Let AI be with you in the
            </h1>
            <h2 className="text-5xl font-bold text-gray-200 leading-tight">
              Air.
            </h2>
            <p className="text-sm text-gray-400 mt-4">
              for Smarter Air Quality Monitoring
            </p>
          </div>
        </div>

        {/* Signup Form - Right Side */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-full max-w-md p-8">
        <Card className="w-full bg-slate-900/80 backdrop-blur-sm border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...register("username")}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.username && (
                  <p className="text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
