import { motion } from "motion/react";
import { Shield } from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export function DeviceVerificationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-24 h-24 bg-warning/10 rounded-full mb-6"
        >
          <Shield className="w-12 h-12 text-warning" />
        </motion.div>

        <h1 className="text-foreground mb-4">Device Pending Approval</h1>
        <p className="text-muted-foreground mb-2">Wait for approval of device to give you access.</p>
        <p className="text-sm text-muted-foreground mb-8">
          You will be notified once approved
        </p>

        <Button variant="outline" onClick={() => navigate("/login")}>
          Back to Login
        </Button>
      </motion.div>
    </div>
  );
}
