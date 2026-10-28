import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeToJosePeekSchedule } from "../firebase/josePeekService";

const PEEK_DURATION_MS = 30_000;
const MAX_TIMER_DELAY_MS = 2_147_000_000;
const SEEN_KEY_PREFIX = "gwa-jose-peek-seen:";
const JOSE_IMAGE_URL = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/jose.png`;
const HIDDEN_POSE = { translateY: 110, opacity: 0, transitionMs: 0, easing: "linear" };

interface PeekPose {
  translateY: number;
  opacity: number;
  transitionMs: number;
  easing: string;
}

const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const ScheduledJosePeek: React.FC = () => {
  const [scheduledAt, setScheduledAt] = useState<number | null>(null);
  const [isPeeking, setIsPeeking] = useState(false);
  const [peekRun, setPeekRun] = useState(0);
  const [pose, setPose] = useState<PeekPose>(HIDDEN_POSE);
  const fallbackSeenSchedule = useRef<number | null>(null);
  const animationTimer = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);
  const nextAnimationFrame = useRef<number | null>(null);
  const animationRun = useRef(0);

  const showPeek = useCallback(() => {
    animationRun.current += 1;
    const runId = animationRun.current;
    if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    if (nextAnimationFrame.current !== null) window.cancelAnimationFrame(nextAnimationFrame.current);

    setPeekRun((currentRun) => currentRun + 1);
    setPose(HIDDEN_POSE);
    setIsPeeking(true);

    const schedule = (callback: () => void, delay: number) => {
      animationTimer.current = window.setTimeout(() => {
        animationTimer.current = null;
        if (animationRun.current === runId) callback();
      }, Math.max(0, delay));
    };

    const finish = () => {
      setPose(HIDDEN_POSE);
      setIsPeeking(false);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPose({ translateY: 36, opacity: 1, transitionMs: 0, easing: "linear" });
      schedule(finish, PEEK_DURATION_MS);
      return;
    }

    const endAt = Date.now() + PEEK_DURATION_MS;
    const createCycle = () => ({
      translateY: randomBetween(18, 58),
      riseMs: randomBetween(1800, 2400),
      holdMs: randomBetween(2000, 3000),
      hideMs: randomBetween(700, 1100),
    });

    const setPoseAfterMount = (nextPose: PeekPose) => {
      animationFrame.current = window.requestAnimationFrame(() => {
        animationFrame.current = null;
        nextAnimationFrame.current = window.requestAnimationFrame(() => {
          nextAnimationFrame.current = null;
          if (animationRun.current === runId) setPose(nextPose);
        });
      });
    };

    const runCycle = (cycle: ReturnType<typeof createCycle>, first = false) => {
      if (Date.now() + cycle.riseMs + cycle.holdMs + cycle.hideMs >= endAt) {
        schedule(finish, endAt - Date.now());
        return;
      }

      const risenPose = {
        translateY: cycle.translateY,
        opacity: 1,
        transitionMs: cycle.riseMs,
        easing: "cubic-bezier(0.37, 0, 0.63, 1)",
      };
      if (first) setPoseAfterMount(risenPose);
      else setPose(risenPose);

      schedule(() => {
        schedule(() => {
          setPose({
            ...HIDDEN_POSE,
            transitionMs: cycle.hideMs,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          });
          schedule(() => {
            const nextCycle = createCycle();
            const hiddenMs = randomBetween(3000, 5000);
            const remainingMs = endAt - Date.now();
            const nextCycleTime = hiddenMs + nextCycle.riseMs + nextCycle.holdMs + nextCycle.hideMs;
            if (nextCycleTime >= remainingMs) {
              schedule(finish, remainingMs);
            } else {
              schedule(() => runCycle(nextCycle), hiddenMs);
            }
          }, cycle.hideMs);
        }, cycle.holdMs);
      }, cycle.riseMs);
    };

    runCycle(createCycle(), true);
  }, []);

  useEffect(() => {
    return subscribeToJosePeekSchedule(
      setScheduledAt,
      (error) => console.warn("Could not load the scheduled Jose peek:", error),
    );
  }, []);

  useEffect(() => () => {
    animationRun.current += 1;
    if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    if (nextAnimationFrame.current !== null) window.cancelAnimationFrame(nextAnimationFrame.current);
  }, []);

  useEffect(() => {
    if (scheduledAt === null) return;

    let triggerTimer = 0;
    const triggerScheduledPeek = () => {
      const seenKey = `${SEEN_KEY_PREFIX}${scheduledAt}`;
      try {
        if (window.localStorage.getItem(seenKey) === "true") return;
        window.localStorage.setItem(seenKey, "true");
      } catch {
        if (fallbackSeenSchedule.current === scheduledAt) return;
        fallbackSeenSchedule.current = scheduledAt;
      }

      showPeek();
    };

    const schedulePeek = () => {
      const delay = scheduledAt - Date.now();
      if (delay <= 0) {
        triggerScheduledPeek();
        return;
      }
      triggerTimer = window.setTimeout(schedulePeek, Math.min(delay, MAX_TIMER_DELAY_MS));
    };

    schedulePeek();

    return () => {
      window.clearTimeout(triggerTimer);
    };
  }, [scheduledAt, showPeek]);

  if (!isPeeking) return null;

  return (
    <img
      key={peekRun}
      src={JOSE_IMAGE_URL}
      alt=""
      aria-hidden="true"
      className="jose-peek"
      style={{
        opacity: pose.opacity,
        transform: `translateY(${pose.translateY}%)`,
        transitionDuration: `${pose.transitionMs}ms`,
        transitionTimingFunction: pose.easing,
      }}
    />
  );
};

export default ScheduledJosePeek;
