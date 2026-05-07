import { motion } from "motion/react";

interface LoadingSkeletonProps {
  variant?: "text" | "card" | "avatar" | "button";
  count?: number;
}

export function LoadingSkeleton({ variant = "text", count = 1 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const variants = {
    text: "h-4 w-full rounded",
    card: "h-32 w-full rounded-xl",
    avatar: "h-12 w-12 rounded-full",
    button: "h-12 w-32 rounded-xl",
  };

  return (
    <>
      {skeletons.map((index) => (
        <motion.div
          key={index}
          className={`${variants[variant]} bg-muted animate-pulse`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </>
  );
}
