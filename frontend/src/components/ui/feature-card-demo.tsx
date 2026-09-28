"use client";

import React, { useState } from "react";
import { FeatureCard } from "@/components/ui/feature-card";
import { Gift, GraduationCap, Users } from "lucide-react";

// Helper component for the demo: Progress Item
export interface SavingsPlanItemProps {
  icon: string;
  fallbackIcon?: React.ReactNode;
  title: string;
  members: number;
  progress: number;
  amount: number;
  target: number;
  daysLeft?: number;
}

export const SavingsPlanItem: React.FC<SavingsPlanItemProps> = ({
  icon,
  fallbackIcon,
  title,
  members,
  progress,
  amount,
  target,
  daysLeft,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="mb-4 flex items-center gap-4 last:mb-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border border-border/50 shadow-xs">
        {!imageError ? (
          <img
            src={icon}
            alt={title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          fallbackIcon || <Users className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="font-semibold text-card-foreground text-sm truncate">{title}</p>
          <p className="text-xs font-bold text-tiranga-saffron-deep">{progress}%</p>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-tiranga-saffron to-tiranga-saffron-deep transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span className="font-medium text-slate-600">₹{amount.toLocaleString("en-IN")} of ₹{target.toLocaleString("en-IN")}</span>
          <div className="flex items-center gap-2">
            {daysLeft !== undefined && (
              <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                {daysLeft} days left
              </span>
            )}
            <span>{members} members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// The main demo component
export const FeatureCardDemo: React.FC = () => {
  return (
    <div className="w-full max-w-4xl p-4 md:p-8">
      <FeatureCard
        title="Multiple Savings Plan"
        description="Nest offers a variety of savings plans, from Flexible to Target Savings, to make sure you can save for what matters most, your way."
      >
        <div className="flex flex-col space-y-4">
          <SavingsPlanItem
            icon="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=128&auto=format&fit=crop&q=80"
            fallbackIcon={<Gift className="h-5 w-5 text-tiranga-saffron" />}
            title="Birthday Milestone Fund"
            progress={63}
            amount={25200}
            target={40200}
            members={200}
          />
          <SavingsPlanItem
            icon="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&auto=format&fit=crop&q=80"
            fallbackIcon={<GraduationCap className="h-5 w-5 text-portal-navy-deep" />}
            title="Higher Education & Graduation"
            progress={63}
            amount={3500}
            target={45000}
            members={200}
          />
          <SavingsPlanItem
            icon="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=128&auto=format&fit=crop&q=80"
            fallbackIcon={<Users className="h-5 w-5 text-tiranga-green" />}
            title="Community Research & Innovation (NYSC)"
            progress={86}
            amount={38000}
            target={42000}
            members={200}
            daysLeft={28}
          />
        </div>
      </FeatureCard>
    </div>
  );
};

export default FeatureCardDemo;
