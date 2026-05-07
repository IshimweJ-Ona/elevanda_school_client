import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, className = "", children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20",
      secondary: "bg-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/20",
      outline: "border-2 border-border bg-transparent hover:bg-muted",
      ghost: "bg-transparent hover:bg-muted",
      danger: "bg-destructive text-destructive-foreground hover:shadow-lg hover:shadow-destructive/20",
    };

    const sizes = {
      sm: "px-3 py-1.5",
      md: "px-6 py-3",
      lg: "px-8 py-4",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
