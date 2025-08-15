'use server';

import { UserService, User } from '@/lib/user-service';
import bcrypt from 'bcryptjs';

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    // Check if user already exists
    const existingUser = await UserService.findUserByEmail(email);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    const existingUsername = await UserService.findUserByUsername(username);
    if (existingUsername) {
      return { success: false, message: 'Username already taken' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await UserService.createUser({
      username,
      email,
      password: hashedPassword
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return { 
      success: true, 
      message: 'User registered successfully',
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Failed to register user' };
  }
}

export async function loginUser(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    // Find user by email or username
    const user = await UserService.findUserByEmailOrUsername(emailOrUsername);
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return { 
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Failed to login' };
  }
}





export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; message: string }> {
  try {
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(userId);
    
    const success = await UserService.updateUser(objectId, updates);
    
    if (success) {
      return { success: true, message: 'Profile updated successfully' };
    } else {
      return { success: false, message: 'Failed to update profile' };
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(userId);
    
    // Get user to verify current password
    const user = await UserService.findUserByEmailOrUsername(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const success = await UserService.updateUser(objectId, { password: hashedNewPassword });
    
    if (success) {
      return { success: true, message: 'Password changed successfully' };
    } else {
      return { success: false, message: 'Failed to change password' };
    }
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, message: 'Failed to change password' };
  }
}


