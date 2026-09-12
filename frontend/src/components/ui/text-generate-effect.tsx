"use client";
import { useEffect } from "react";
import { motion, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  textClassName,
  style,
  as = "div",
  filter = true,
  duration = 0.4,
  delay = 0,
  staggerDelay = 0.06,
}: {
  words: string;
  className?: string;
  textClassName?: string;
  style?: React.CSSProperties;
  as?: "h1" | "p" | "div" | "span";
  filter?: boolean;
  duration?: number;
  delay?: number;
  staggerDelay?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      ".generate-word",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration || 0.4,
        delay: (i) => delay + i * staggerDelay,
      }
    );
  }, [scope, delay, duration, filter, staggerDelay, animate]);

  const Tag = as as any;

  return (
    <Tag ref={scope} className={cn(className)} style={style}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className={cn("generate-word opacity-0 inline", textClassName)}
          style={{
            filter: filter ? "blur(8px)" : "none",
          }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </Tag>
  );
};
