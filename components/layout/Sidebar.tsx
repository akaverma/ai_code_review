"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoryList } from "@/components/history/HistoryList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sidebarSet } from "@/store/slices/uiSlice";

/** Collapsible panel showing recent review history, used on the /review page. */
export function Sidebar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.sidebarOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(sidebarSet(false))}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed right-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-full max-w-sm overflow-y-auto border-l bg-background p-4 shadow-lg scrollbar-thin lg:w-96"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4" />
                Recent Reviews
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(sidebarSet(false))}
                aria-label="Close history panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <HistoryList onSelect={() => dispatch(sidebarSet(false))} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
