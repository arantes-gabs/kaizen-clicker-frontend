import { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatNumber } from "../../utils/format";

interface ClickerCoreProps {
  clickPower: number;
  isPaused: boolean;
  onClickFactory: () => void;
}

interface ClickFeedback {
  id: number;
  value: number;
  x: number;
  y: number;
}

const MAX_FEEDBACKS = 10;

export const ClickerCore = memo(function ClickerCore({
  clickPower,
  isPaused,
  onClickFactory,
}: ClickerCoreProps) {
  const [feedbacks, setFeedbacks] = useState<ClickFeedback[]>([]);
  const feedbackIdRef = useRef(0);
  const feedbackTimersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      feedbackTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  function handleClick(): void {
    if (isPaused) {
      return;
    }

    onClickFactory();

    feedbackIdRef.current += 1;
    const id = feedbackIdRef.current;
    const feedback: ClickFeedback = {
      id,
      value: clickPower,
      x: Math.round(Math.random() * 70 - 35),
      y: Math.round(Math.random() * 24 - 12),
    };

    setFeedbacks((currentFeedbacks) =>
      [...currentFeedbacks, feedback].slice(-MAX_FEEDBACKS),
    );

    const timerId = window.setTimeout(() => {
      setFeedbacks((currentFeedbacks) =>
        currentFeedbacks.filter((item) => item.id !== id),
      );
      feedbackTimersRef.current = feedbackTimersRef.current.filter(
        (currentTimerId) => currentTimerId !== timerId,
      );
    }, 850);
    feedbackTimersRef.current.push(timerId);
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[280px] justify-center py-1 sm:max-w-[310px] sm:py-2">
      <motion.div
        className="absolute inset-x-5 bottom-0 h-10 rounded-full bg-emerald-500/20 blur-xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.button
        type="button"
        className="factory-button relative grid aspect-square w-[min(52vw,218px)] place-items-center rounded-full border-[7px] border-white bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 text-center shadow-[0_14px_0_#c98508,0_24px_34px_rgba(180,83,9,0.24)] outline-none disabled:cursor-not-allowed disabled:grayscale sm:w-[min(58vw,248px)]"
        disabled={isPaused}
        onClick={handleClick}
        whileHover={isPaused ? undefined : { scale: 1.035, rotate: -0.8 }}
        whileTap={isPaused ? undefined : { scaleX: 1.05, scaleY: 0.9, y: 12 }}
        animate={{
          boxShadow: [
            "0 14px 0 #c98508, 0 24px 34px rgba(180,83,9,0.24)",
            "0 14px 0 #c98508, 0 30px 46px rgba(52,211,153,0.34)",
            "0 14px 0 #c98508, 0 24px 34px rgba(180,83,9,0.24)",
          ],
        }}
        transition={{
          boxShadow: { duration: 1.9, repeat: Infinity, ease: "easeInOut" },
          type: "spring",
          stiffness: 520,
          damping: 20,
        }}
        aria-label="Apertar o núcleo Kaizen"
      >
        <span className="absolute inset-3 rounded-full border-[5px] border-amber-100/80 bg-[repeating-linear-gradient(135deg,rgba(15,23,42,0.14)_0_8px,transparent_8px_16px)]" />
        <span className="absolute left-8 top-8 h-3 w-3 rounded-full bg-white shadow-inner" />
        <span className="absolute right-8 top-8 h-3 w-3 rounded-full bg-white shadow-inner" />
        <span className="absolute bottom-8 left-8 h-3 w-3 rounded-full bg-white shadow-inner" />
        <span className="absolute bottom-8 right-8 h-3 w-3 rounded-full bg-white shadow-inner" />

        <motion.span
          className="relative z-10 grid aspect-square w-[74%] place-items-center rounded-full border-[6px] border-white bg-gradient-to-br from-emerald-200 via-emerald-300 to-lime-200 shadow-[inset_0_8px_0_rgba(255,255,255,0.55),inset_0_-14px_0_rgba(16,185,129,0.28),0_8px_0_#0f9f6e]"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="absolute top-7 h-8 w-8 rounded-full bg-white/45 blur-sm" />
          <span className="font-display text-3xl font-black leading-none text-emerald-950 sm:text-5xl">
            Clique!
          </span>
          <span className="mt-[-0.35rem] rounded-full border-2 border-emerald-700/10 bg-white/75 px-3 py-0.5 text-xs font-black uppercase text-emerald-800">
            +{formatNumber(clickPower)} por clique
          </span>
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {feedbacks.map((feedback) => (
          <motion.span
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 rounded-full border-2 border-white bg-amber-300 px-3 py-1.5 font-display text-xl font-black text-amber-950 shadow-[0_5px_0_#d08a09]"
            key={feedback.id}
            initial={{
              opacity: 0,
              scale: 0.45,
              x: feedback.x,
              y: feedback.y,
            }}
            animate={{
              opacity: 1,
              scale: [0.7, 1.12, 1],
              y: feedback.y - 88,
            }}
            exit={{ opacity: 0, scale: 0.8, y: feedback.y - 112 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            +{formatNumber(feedback.value)}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
});
