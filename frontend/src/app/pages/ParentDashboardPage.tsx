import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/Card";
import { ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getParentDashboard } from "../lib/api";
import { toast } from "sonner";

export function ParentDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await getParentDashboard();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const overview = useMemo(() => {
    return [
      {
        title: "Account Status",
        value: user?.isVerified ? "Approved" : "Pending",
        icon: ShieldCheck
      },
      {
        title: "Role",
        value: user?.role ?? "PARENT",
        icon: UserCheck
      },
    ];
  }, [user?.isVerified, user?.role]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground mb-1">Parent Home</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground mb-1">Parent Home</h1>
        <p className="text-muted-foreground">Welcome back, {user?.firstName ?? user?.name ?? "Parent"}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.map((item) => (
          <Card key={item.title}>
            <CardContent className="flex items-start gap-4">
              <div className="rounded-xl bg-secondary/10 p-3 text-secondary">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="text-foreground text-lg font-semibold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <h2 className="text-foreground mb-2">Account Active</h2>
          <p className="text-sm text-muted-foreground">
            Your parent account is approved and ready to use.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
