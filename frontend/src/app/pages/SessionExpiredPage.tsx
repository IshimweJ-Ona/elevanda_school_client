import { motion } from "motion/react";
import { Clock } from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export function SessionExpiredPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-destructive/10 rounded-full mb-6">
          <Clock className="w-12 h-12 text-destructive" />
        </div>

        <h1 className="text-foreground mb-4">Session Expired</h1>
        <p className="text-muted-foreground mb-8">
          Your session has expired. Please login again.
        </p>

        <Button onClick={() => navigate("/login")}>
          Login
        </Button>
      </motion.div>
    </div>
  );
}
