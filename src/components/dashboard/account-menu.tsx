"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type StoredUser = {
  name: string;
  username: string;
  email: string;
  password: string;
  dob?: string;
  gender?: string;
  healthConditions?: string;
};

export function AccountMenu({ onProfileUpdated }: { onProfileUpdated?: (u: Pick<StoredUser, "name" | "username" | "healthConditions">) => void }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openReset, setOpenReset] = useState(false);

  // edit fields
  const [username, setUsername] = useState("");
  const [healthConditions, setHealthConditions] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // reset fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('breatheEasyUser') : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredUser;
        setUser(parsed);
        setUsername(parsed.username || "");
        setHealthConditions(parsed.healthConditions || "");
      } catch {}
    }
  }, [openEdit, openReset]);

  const handleSaveDetails = () => {
    setSaveMessage("");
    if (!user) { setSaveMessage("Please login again."); return; }
    if (!username.trim()) { setSaveMessage("Username cannot be empty."); return; }
    if (username.length < 3) { setSaveMessage("Username must be at least 3 characters."); return; }
    if (username.length > 20) { setSaveMessage("Username must be less than 20 characters."); return; }
    
    const updated: StoredUser = { ...user, username: username.trim(), healthConditions: healthConditions.trim() };
    localStorage.setItem('breatheEasyUser', JSON.stringify(updated));
    setUser(updated);
    setSaveMessage("Saved.");
    onProfileUpdated?.({ name: updated.name, username: updated.username, healthConditions: updated.healthConditions });
    setTimeout(() => setOpenEdit(false), 700);
  };

  const handleResetPassword = () => {
    setResetMessage("");
    if (!user) { setResetMessage("Please login again."); return; }
    if (!currentPw) { setResetMessage("Enter current password."); return; }
    if (currentPw !== user.password) { setResetMessage("Current password incorrect."); return; }
    if (newPw.length < 6) { setResetMessage("New password must be at least 6 chars."); return; }
    if (newPw !== confirmPw) { setResetMessage("New passwords do not match."); return; }
    const updated: StoredUser = { ...user, password: newPw };
    localStorage.setItem('breatheEasyUser', JSON.stringify(updated));
    setUser(updated);
    setResetMessage("Password updated.");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setOpenReset(false), 700);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-slate-800 border-slate-700 text-white rounded-lg">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-900/90 border-slate-700 text-white">
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="focus:bg-slate-800">Edit personal details</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenReset(true)} className="focus:bg-slate-800">Reset password</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Details Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-slate-900/90 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit personal details</DialogTitle>
          </DialogHeader>
          {!user ? (
            <p className="text-sm text-slate-400">Please login.</p>
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
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., john_doe" className="bg-slate-800 border-slate-700" />
                <p className="text-[11px] text-slate-400 mt-1">This is how other users will see you.</p>
              </div>
              <div>
                <Label htmlFor="health">Health Conditions</Label>
                <Textarea id="health" value={healthConditions} onChange={(e) => setHealthConditions(e.target.value)} placeholder="e.g., Asthma, Allergies" className="bg-slate-800 border-slate-700" />
                <p className="text-[11px] text-slate-400 mt-1">AI recommendations use this to tailor advice.</p>
              </div>
              {saveMessage && <p className="text-sm text-green-400">{saveMessage}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="bg-slate-800 border-slate-700" onClick={() => setOpenEdit(false)}>Cancel</Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600 border-cyan-500" onClick={handleSaveDetails}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={openReset} onOpenChange={setOpenReset}>
        <DialogContent className="bg-slate-900/90 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
          </DialogHeader>
          {!user ? (
            <p className="text-sm text-slate-400">Please login.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentPw">Current Password</Label>
                  <Input id="currentPw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="bg-slate-800 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="newPw">New Password</Label>
                  <Input id="newPw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="bg-slate-800 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="confirmPw">Confirm New Password</Label>
                  <Input id="confirmPw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              {resetMessage && <p className="text-sm text-green-400">{resetMessage}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="bg-slate-800 border-slate-700" onClick={() => setOpenReset(false)}>Cancel</Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600 border-cyan-500" onClick={handleResetPassword}>Update Password</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


