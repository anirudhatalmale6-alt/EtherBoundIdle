import { useToast } from "@/components/ui/use-toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const VARIANT_STYLES = {
  default: "bg-zinc-900 border-zinc-700 text-white",
  destructive: "bg-red-950 border-red-700 text-red-100",
  success: "bg-emerald-950 border-emerald-700 text-emerald-100",
};

const VARIANT_ICON = {
  default: <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />,
  destructive: <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />,
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts
          .filter((t) => t.open)
          .map(({ id, title, description, variant = "default" }) => (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl ${VARIANT_STYLES[variant] || VARIANT_STYLES.default}`}
            >
              {VARIANT_ICON[variant] || VARIANT_ICON.default}
              <div className="flex-1 min-w-0">
                {title && <p className="text-sm font-semibold leading-snug">{title}</p>}
                {description && <p className="text-xs opacity-75 mt-0.5 leading-snug">{description}</p>}
              </div>
              <button
                onClick={() => dismiss(id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}