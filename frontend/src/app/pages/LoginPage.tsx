import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const result = await login({ identifier, password });
      toast.success("Login successful!");

      if (result.user?.role === "PARENT") {
        navigate("/app/parent", { replace: true });
      } else {
        navigate("/app/parent", { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "DEVICE_NOT_VERIFIED") {
        navigate("/registration-pending", { replace: true });
        return;
      }

      const message = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4"
          >
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Login to your account</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Phone Number"
              type="text"
              placeholder="Enter email or +250..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={error && !identifier ? "Required" : ""}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error && !password ? "Required" : ""}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Login
            </Button>

            <div className="text-center">
              <Link to="#" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
