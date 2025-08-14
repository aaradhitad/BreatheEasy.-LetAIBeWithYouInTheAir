"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
  healthConditions: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      dob: '',
      gender: 'prefer-not-to-say',
      healthConditions: '',
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    localStorage.setItem('breatheEasyUser', JSON.stringify(data));
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white py-8" style={{backgroundImage: "url('/background-hero.svg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="flex-1"></div>
      <div className="flex items-center justify-center w-full max-w-md p-8 mr-16">
        <Card className="w-full bg-slate-900/80 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Sign Up</CardTitle>
          <CardDescription className="text-slate-400">Create an account to get personalized health recommendations.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="name" {...field} className="bg-slate-800 border-slate-700" />}
              />
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g., john_doe"
                    {...field}
                    className="bg-slate-800 border-slate-700"
                  />
                )}
              />
              {errors.username && <p className="text-sm text-red-400">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input id="email" type="email" placeholder="m@example.com" {...field} className="bg-slate-800 border-slate-700" />}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <Input id="password" type="password" {...field} className="bg-slate-800 border-slate-700" />}
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => <Input id="dob" type="date" {...field} className="bg-slate-800 border-slate-700" />}
                  />
                  {errors.dob && <p className="text-sm text-red-400">{errors.dob.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="gender" className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && <p className="text-sm text-red-400">{errors.gender.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthConditions">Existing Health Conditions</Label>
              <Controller
                name="healthConditions"
                control={control}
                render={({ field }) => <Textarea id="healthConditions" placeholder="e.g., Asthma, Allergies" {...field} className="bg-slate-800 border-slate-700" />}
              />
              {errors.healthConditions && <p className="text-sm text-red-400">{errors.healthConditions.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 border-cyan-500 text-white rounded-lg">
              Create Account
            </Button>
            <p className="text-sm text-center text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
        </Card>
      </div>
    </div>
  );
}
