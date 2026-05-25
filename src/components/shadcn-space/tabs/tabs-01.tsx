"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type TabItem = {
  title: string;
  value: string;
  content?: React.ReactNode;
};

export type TabsProps = {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  layoutIdPrefix?: string;
};

export const ReusableAnimatedTabs = ({
  tabs,
  activeTab,
  onTabChange,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  layoutIdPrefix = "tabs-component",
}: TabsProps) => {
  const [internalActiveIdx, setInternalActiveIdx] = useState(0);
  const [hovering, setHovering] = useState(false);
  const isControlled = activeTab !== undefined;
  const currentActiveIdx = isControlled
    ? tabs.findIndex((t) => t.value === activeTab)
    : internalActiveIdx;
  const activeIdx = currentActiveIdx === -1 ? 0 : currentActiveIdx;

  const handleSelect = (idx: number) => {
    if (!isControlled) {
      setInternalActiveIdx(idx);
    }
    if (onTabChange) {
      onTabChange(tabs[idx].value);
    }
  };

  const reorderedTabs = [
    tabs[activeIdx],
    ...tabs.filter((_, i) => i !== activeIdx),
  ];

  return (
    <div className="w-full flex flex-col">
      <div
        className={cn(
          "flex flex-row items-center justify-start perspective-[1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full gap-1",
          containerClassName,
        )}>
        {tabs.map((tab, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={tab.value}
              onClick={() => handleSelect(idx)}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              className={cn("relative px-4 py-2 rounded-full transition-colors duration-200", tabClassName)}
              style={{ transformStyle: "preserve-3d" }}>
              {isActive && (
                <motion.div
                  layoutId={`${layoutIdPrefix}-active-bg`}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  className={cn(
                    "absolute inset-0 bg-primary rounded-full",
                    activeTabClassName,
                  )}
                />
              )}
              <span
                className={cn(
                  "relative block text-sm font-medium",
                  isActive ? "text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.title}
              </span>
            </button>
          );
        })}
      </div>

      <FadeInStack
        tabs={reorderedTabs}
        hovering={hovering}
        layoutIdPrefix={layoutIdPrefix}
        className={cn("mt-10", contentClassName)}
      />
    </div>
  );
};

type FadeInStackProps = {
  className?: string;
  tabs: TabItem[];
  hovering?: boolean;
  layoutIdPrefix: string;
};

const FadeInStack = ({ className, tabs, hovering, layoutIdPrefix }: FadeInStackProps) => {
  return (
    <div className="relative w-full h-[300px]">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={`${layoutIdPrefix}-${tab.value}`}
          style={{
            scale: 1 - idx * 0.05,
            top: hovering ? idx * -12 : 0,
            zIndex: tabs.length - idx,
            opacity: idx < 3 ? 1 - idx * 0.15 : 0,
          }}
          animate={{
            y: idx === 0 ? [0, 15, 0] : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn("w-full h-full absolute top-0 left-0 origin-top", className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};