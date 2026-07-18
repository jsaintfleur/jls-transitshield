"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { StormScenario } from "@/lib/types";

const Skeleton = ({ height }: { height: number }) => (
  <div
    aria-hidden="true"
    className="animate-pulse rounded-[var(--radius-xl)] bg-[var(--bg-inset)]"
    style={{ height }}
  />
);

const DynamicRiskMap = dynamic(() => import("./RiskMap").then((mod) => mod.RiskMap), {
  loading: () => <Skeleton height={720} />,
});

const DynamicStormScenarioPanel = dynamic(
  () => import("./StormScenarioPanel").then((mod) => mod.StormScenarioPanel),
  { loading: () => <Skeleton height={520} /> },
);

export function LazyRiskMap() {
  const { ref, visible } = useDeferredVisible<HTMLDivElement>();
  return <div ref={ref}>{visible ? <DynamicRiskMap /> : <Skeleton height={720} />}</div>;
}

export function LazyStormScenarioPanel({ scenarios }: { scenarios: StormScenario[] }) {
  const { ref, visible } = useDeferredVisible<HTMLDivElement>();
  return <div ref={ref}>{visible ? <DynamicStormScenarioPanel scenarios={scenarios} /> : <Skeleton height={520} />}</div>;
}

function useDeferredVisible<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}
