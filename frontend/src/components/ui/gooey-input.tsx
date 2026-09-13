"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function GooeyFilter({
  filterId,
  blur,
}: {
  filterId: string;
  blur: number;
}) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feMerge>
            <feMergeNode in="goo" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

function EmailIcon({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </motion.svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      className="size-4 shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const transition = {
  duration: 0.45,
  type: "spring" as const,
  bounce: 0.22,
};

const leftBubbleVariants = {
  collapsed: { scale: 0, opacity: 0, x: 35 },
  expanded: { scale: 1, opacity: 1, x: 0 },
};

const rightBubbleVariants = {
  collapsed: { scale: 0, opacity: 0, x: -35 },
  expanded: { scale: 1, opacity: 1, x: 0 },
};

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  /** Collapsed control width in px */
  collapsedWidth?: number;
  /** Expanded control width in px */
  expandedWidth?: number;
  /** Gaussian blur amount for the gooey SVG filter */
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (email: string) => void;
  disabled?: boolean;
}

export function GooeyInput({
  placeholder = "Enter your email...",
  className,
  classNames,
  collapsedWidth = 110,
  expandedWidth = 240,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  onSubmit,
  disabled = false,
}: GooeyInputProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isControlled = valueProp !== undefined;
  const emailText = isControlled ? valueProp : uncontrolledValue;

  const setEmailText = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = useCallback(
    (next: boolean) => {
      setIsExpanded(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setEmailText("");
      setIsSubmitted(false);
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setEmailText]);

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEmailText(e.target.value);
    },
    [setEmailText],
  );

  const handleBlur = useCallback(() => {
    if (!emailText && !isSubmitted) {
      setExpanded(false);
    }
  }, [emailText, isSubmitted, setExpanded]);

  const handleSubmit = useCallback(() => {
    if (disabled || !emailText) return;
    setIsSubmitted(true);
    onSubmit?.(emailText);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 2500);
  }, [disabled, emailText, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const containerVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth },
      expanded: { width: expandedWidth + 104 }, // space for left (40px) + right (40px) + gaps
    }),
    [collapsedWidth, expandedWidth],
  );

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth },
      expanded: { width: expandedWidth },
    }),
    [collapsedWidth, expandedWidth],
  );

  const surfaceClass =
    "bg-[#16121e] text-white border-2 border-[#685c82] shadow-[0_2px_12px_rgba(0,0,0,0.5)]";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        className,
        classNames?.root,
      )}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <motion.div
        className={cn(
          "relative flex h-10 items-center justify-center",
          classNames?.filterWrap,
        )}
        variants={containerVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={transition}
        style={{ filter: `url(#${filterId})` }}
      >
        {/* Left Pop-out Email Bubble */}
        <motion.div
          className={cn(
            "absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center z-20 pointer-events-none",
            classNames?.bubble,
          )}
          variants={leftBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              surfaceClass,
              classNames?.bubbleSurface,
            )}
          >
            <EmailIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>

        {/* Central Input Pill Bar */}
        <motion.div
          className={cn("flex h-10 items-center justify-center z-10", classNames?.buttonRow)}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-rowan-light outline-none transition-[color,border-color,background-color] hover:border-[#7e709c] focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
              surfaceClass,
              classNames?.trigger,
            )}
            style={{
              fontFamily: "'Rowan-Light', serif",
              fontVariantLigatures: "none",
              fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
            }}
          >
            {!isExpanded ? (
              <EmailIcon layoutId={iconLayoutId} />
            ) : null}

            <motion.input
              layoutId={inputLayoutId}
              ref={inputRef}
              type="email"
              enterKeyHint="send"
              autoComplete="email"
              value={emailText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              disabled={disabled || !isExpanded}
              placeholder={isExpanded ? placeholder : "email"}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none font-rowan-light tracking-wide",
                isExpanded
                  ? "placeholder:text-neutral-400 cursor-text"
                  : "pointer-events-none placeholder:text-neutral-200 cursor-pointer text-center",
                classNames?.input,
              )}
              style={{
                fontFamily: "'Rowan-Light', serif",
                fontVariantLigatures: "none",
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
            />
          </button>
        </motion.div>

        {/* Right Pop-out Submit Button */}
        <motion.div
          className={cn(
            "absolute top-1/2 right-0 flex size-10 -translate-y-1/2 items-center justify-center z-20",
            classNames?.bubble,
          )}
          variants={rightBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <button
            type="button"
            aria-label="Submit email"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSubmit}
            className={cn(
              "flex size-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200",
              surfaceClass,
              isSubmitted
                ? "bg-emerald-600 text-white ring-emerald-500 hover:bg-emerald-700 border-emerald-500"
                : "hover:bg-[#201a2d] hover:border-[#8574a6] hover:scale-105 active:scale-95",
              classNames?.bubbleSurface,
            )}
          >
            {isSubmitted ? (
              <CheckIcon />
            ) : (
              <ArrowRightIcon />
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default GooeyInput;
