
"use client";

import { useEffect, useState } from "react";
import { useInView } from "motion/react";
import { useRef } from "react";

type AnimatedCounterProps = {
  value: number;
  duration?: number;
  suffix?: string;
};

function RollingDigit({
  digit,
  delay,
}: {
  digit: number;
  delay: number;
}) {
  return (
    <span className="relative inline-block h-[1.15em] w-[0.62em] overflow-hidden align-bottom">
      <span
        className="absolute left-0 top-0 flex flex-col"
        style={{
          transform: `translateY(-${digit * 10}%)`,
          transition: `transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        }}
      >
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className="flex h-[1.15em] w-[0.62em] items-center justify-center"
          >
            {index}
          </span>
        ))}
      </span>
    </span>
  );
}

export function AnimatedCounter({
  value,
  duration = 2,
  suffix = "+",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) / (duration * 1000),
        1
      );

      // Smooth ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  const formattedNumber = count.toLocaleString();
  const digits = formattedNumber.split("");

  return (
    <span
      ref={ref}
      className="inline-flex items-center tabular-nums"
      aria-label={`${value.toLocaleString()}${suffix}`}
    >
      {digits.map((character, index) => {
        if (character === ",") {
          return (
            <span
              key={`${character}-${index}`}
              className="mx-[0.02em]"
            >
              ,
            </span>
          );
        }

        return (
          <RollingDigit
            key={`${character}-${index}`}
            digit={Number(character)}
            delay={index * 0.025}
          />
        );
      })}

      <span className="ml-[0.03em]">{suffix}</span>
    </span>
  );
}

