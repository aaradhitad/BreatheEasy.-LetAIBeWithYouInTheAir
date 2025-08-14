"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type StoredUser = {
  name: string;
  email: string;
  password: string;
  dob?: string;
  gender?: string;
  healthConditions?: string;
};

export function AccountButton({ onProfileUpdated }: { onProfileUpdated?: (u: Pick<StoredUser, "name" | "healthConditions">) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [healthConditions, setHealthConditions] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("breatheEasyUser");
      if (raw) {
        const parsed = JSON.parse(raw) as StoredUser;
        setUser(parsed);
        setHealthConditions(parsed.healthConditions || "");
      }
    } finally {
      setLoading(false);
    }
  }, [open]);

  const handleSave = () => {
    setError("");
    setSuccess("");
    if (!user) {
      setError("No user found. Please sign in again.");
      return;
    }
    const updated: StoredUser = { ...user, healthConditions: healthConditions.trim() };

    // Password change if provided
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError("Enter your current password to change it.");
        return;
      }
      if (currentPassword !== user.password) {
        setError("Current password is incorrect.");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      updated.password = newPassword;
    }

    localStorage.setItem("breatheEasyUser", JSON.stringify(updated));
    setUser(updated);
    setSuccess("Account updated successfully.");
    onProfileUpdated?.({ name: updated.name, healthConditions: updated.healthConditions });
    // Clear passwords after save
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    // Optionally auto-close after short delay
    setTimeout(() => setOpen(false), 800);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-slate-800 border-slate-700 text-white rounded-lg">Account</Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900/90 border-slate-700 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Account</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : !user ? (
          <p className="text-sm text-red-400">No user found. Please login again.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user.name} readOnly className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} readOnly className="bg-slate-800 border-slate-700" />
              </div>
            </div>

            <div>
              <Label htmlFor="health">Health Conditions</Label>
              <Textarea id="health" value={healthConditions} onChange={(e) => setHealthConditions(e.target.value)} placeholder="e.g., Asthma, Allergies" className="bg-slate-800 border-slate-700" />
              <p className="text-[11px] text-slate-400 mt-1">AI recommendations use this to tailor advice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentPw">Current Password</Label>
                <Input id="currentPw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label htmlFor="newPw">New Password</Label>
                <Input id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label htmlFor="confirmPw">Confirm New Password</Label>
                <Input id="confirmPw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-slate-800 border-slate-700" />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-slate-800 border-slate-700" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600 border-cyan-500" onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


