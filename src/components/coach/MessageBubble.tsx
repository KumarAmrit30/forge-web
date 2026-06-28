"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/components/home/motion";
import { homeSerif } from "@/components/home/home-ui";
import type { CoachMessage } from "@/lib/coach/coach-types";

type Props = {
  message: CoachMessage;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const parsed = message.parsed;
  const isReflection = message.experience?.isReflectionMode ?? false;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[90%] rounded-[20px] px-4 py-4",
          isUser
            ? "border border-white/[0.06] bg-white/[0.04] text-foreground/90"
            : "border border-white/[0.05] bg-gradient-to-br from-white/[0.04] to-transparent"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-3.5">
            {isReflection && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/50">
                Reflection
              </p>
            )}
            {parsed && (
              <p className={`${homeSerif} text-lg leading-snug text-white/90`}>
                {parsed.summary}
              </p>
            )}
            {parsed && parsed.insights.length > 0 && (
              <ul className="space-y-2">
                {parsed.insights.map((insight) => (
                  <li
                    key={insight}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground/80"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                    {insight}
                  </li>
                ))}
              </ul>
            )}
            {parsed &&
              !isReflection &&
              parsed.recommendations.length > 0 && (
                <ul className="space-y-1.5 border-t border-white/[0.05] pt-3">
                  {parsed.recommendations.map((item) => (
                    <li
                      key={item}
                      className="text-sm leading-relaxed text-muted-foreground/70"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            {!parsed && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground/80">
                {message.content}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
