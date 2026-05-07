import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Lock, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchProfile, updateProfile } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [form, setForm] = useState({ name: "", email: "", phone_number: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchProfile();
        setProfile(result.user);
        setForm({
          name: result.user?.name ?? "",
          email: result.user?.email ?? "",
          phone_number: result.user?.phone_number ?? ""
        });

      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load profile";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const result = await updateProfile({
        name: form.name,
        email: form.email,
        phone_number: form.phone_number
      });
      setProfile(result.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        password: newPassword
      });
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const initials = useMemo(() => {
    const name = profile?.name ?? authUser?.name ?? "";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  }, [profile?.name, authUser?.name]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-foreground mb-1">Profile</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-foreground mb-1">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <h2 className="text-foreground">Personal Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-3xl text-primary-foreground">{initials}</span>
            </div>
            <div>
              <h3 className="text-foreground mb-1">{profile?.name ?? "User"}</h3>
              <p className="text-sm text-muted-foreground">{profile?.role ?? "Account"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone_number}
              onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} loading={saving}>
              <Save className="w-5 h-5" />
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-foreground">Account Actions</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPasswordModal(true)}
          >
            <Lock className="w-5 h-5" />
            Change Password
          </Button>

          <Button variant="danger" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-foreground mb-6">Change Password</h2>

            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handlePasswordChange} loading={saving}>
                  Update
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
