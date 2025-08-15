"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { updateUserProfile, changePassword } from "@/app/auth-actions";
import { User, Settings, Key, User as UserIcon } from "lucide-react";

interface StoredUser {
  _id: string;
  username: string;
  email: string;
  healthConditions?: string;
}

interface AccountMenuProps {
  user: StoredUser;
  onProfileUpdated: (user: StoredUser) => void;
}

export function AccountMenu({ user, onProfileUpdated }: AccountMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [username, setUsername] = useState(user.username);
  const [healthConditions, setHealthConditions] = useState(user.healthConditions || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveDetails = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateUserProfile(user._id, {
        username,
        healthConditions: healthConditions || undefined
      });

      if (result.success) {
        setSuccess(result.message);
        const updatedUser = { ...user, username, healthConditions };
        onProfileUpdated(updatedUser);
        
        // Reset form
        setUsername(user.username);
        setHealthConditions(user.healthConditions || '');
        setIsEditing(false);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await changePassword(user._id, currentPassword, newPassword);

      if (result.success) {
        setSuccess(result.message);
        
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setUsername(user.username);
    setHealthConditions(user.healthConditions || '');
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  };

  const cancelPasswordChange = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setIsChangingPassword(false);
  };

  const openProfileDialog = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setError(null);
    setSuccess(null);
    setDialogOpen(true);
  };

  const openPasswordDialog = () => {
    setIsEditing(false);
    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);
    setDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-white rounded-lg backdrop-blur-sm">
            <UserIcon className="mr-2 h-4 w-4" />
            Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-900/90 border-slate-700 text-white w-48">
          <DropdownMenuItem onClick={openProfileDialog} className="focus:bg-slate-800 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openPasswordDialog} className="focus:bg-slate-800 cursor-pointer">
            <Key className="mr-2 h-4 w-4" />
            Change Password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900/90 border-slate-700 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isChangingPassword ? (
                <>
                  <Key className="h-5 w-5 text-cyan-400" />
                  Change Password
                </>
              ) : (
                <>
                  <User className="h-5 w-5 text-cyan-400" />
                  Profile Settings
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {!isChangingPassword ? (
            // Profile Settings
            <div className="space-y-4">
              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">Username</Label>
                    <p className="text-white font-medium">{user.username}</p>
                  </div>
                <div>
                    <Label className="text-slate-300">Email</Label>
                    <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                    <Label className="text-slate-300">Health Conditions</Label>
                    <p className="text-white font-medium">
                      {user.healthConditions || 'None specified'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 w-full"
                  >
                    Edit Details
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="healthConditions">Health Conditions</Label>
                    <Textarea
                      id="healthConditions"
                      value={healthConditions}
                      onChange={(e) => setHealthConditions(e.target.value)}
                      placeholder="Any existing health conditions or allergies..."
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={3}
                    />
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

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveDetails}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      onClick={cancelEdit}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1"
                    >
                      Cancel
                    </Button>
              </div>
            </div>
          )}
            </div>
          ) : (
            // Change Password
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
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

              <div className="flex gap-2">
                <Button 
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
                <Button 
                  onClick={cancelPasswordChange}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


