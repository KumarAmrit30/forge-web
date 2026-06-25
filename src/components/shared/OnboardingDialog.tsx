"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ONBOARDING_KEY = "forge-onboarding-seen";

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Welcome to Forge</DialogTitle>
          <DialogDescription>
            Forge is your daily operating system. Dashboard shows priorities;
            Today is where you execute.
          </DialogDescription>
          <div className="space-y-3 pt-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Dashboard</strong> — what matters
              today.
            </p>
            <p>
              <strong className="text-foreground">Today</strong> — routines, habits,
              workout, nutrition.
            </p>
            <p>
              <strong className="text-foreground">Blueprint</strong> — your operating
              manual.
            </p>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Link href="/today" onClick={dismiss}>
            <Button className="w-full">Start Today</Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={dismiss}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
