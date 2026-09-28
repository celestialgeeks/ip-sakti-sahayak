"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Define the props for the FeatureCard component
export interface FeatureCardProps
  extends Omit<HTMLMotionProps<"div">, "title" | "children"> {
  title: string;
  description: string;
  children: React.ReactNode;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    // Animation variants for framer-motion
    const cardVariants = {
      offscreen: {
        y: 24,
        opacity: 0,
      },
      onscreen: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring" as const,
          bounce: 0.35,
          duration: 0.7,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.2 }}
        variants={cardVariants}
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-2xl border border-portal-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md md:p-8",
          className
        )}
        {...props}
      >
        <div className="flex-grow">
          {/* Card Header: Title and Description */}
          <h3 className="text-xl font-bold tracking-tight text-portal-navy-deep">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="mt-6">{children}</div>
      </motion.div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export { FeatureCard };
