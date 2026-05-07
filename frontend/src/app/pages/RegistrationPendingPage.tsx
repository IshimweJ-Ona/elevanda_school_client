import { Motion, motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function RegistrationPendingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border p-10"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-4">Registration Submitted</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Thank you for registering into our system. Wait for admins to approve this registration. This might take more than 48 hours. You will get an email when approved.
          </p>
          <div className="space-y-4 text-left">
            <div className="rounded-2xl border border-border bg-secondary/5 p-4">
              <p className="text-foreground font-semibold">What happens next?</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Admin will verify your device and approve your registration.</li>
                <li>Only verified parent accounts can log in.</li>
                <li>Please check your email for approval status updates.</li>
              </ul>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/login" className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Return to login page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
