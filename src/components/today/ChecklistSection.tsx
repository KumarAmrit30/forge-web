"use client";

import { Check } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { HomeSurfaceCard } from "@/components/home/home-ui";

type Props = {
  title: string;
  items: Record<string, boolean>;
  onToggle: (key: string) => void;
};

export function ChecklistSection({ title, items, onToggle }: Props) {
  const entries = Object.entries(items);

  return (
    <HomeSurfaceCard elevation="insight" className="px-5 py-4">
      <h3 className="text-sm font-medium text-foreground/90">{title}</h3>
      <LayoutGroup>
        <div className="mt-3 space-y-1">
          {entries.map(([key, done]) => (
            <motion.button
              key={key}
              layout
              type="button"
              onClick={() => onToggle(key)}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
            >
              <motion.span
                layout
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  done
                    ? "border-primary bg-primary"
                    : "border-white/25 bg-transparent"
                )}
              >
                {done && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
                  >
                    <Check
                      className="h-3.5 w-3.5 text-primary-foreground"
                      strokeWidth={2.5}
                    />
                  </motion.span>
                )}
              </motion.span>
              <motion.span
                layout
                animate={{ opacity: done ? 0.55 : 1 }}
                transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
                className={cn(
                  "text-sm",
                  done && "text-muted-foreground"
                )}
              >
                {key}
              </motion.span>
            </motion.button>
          ))}
        </div>
      </LayoutGroup>
    </HomeSurfaceCard>
  );
}
