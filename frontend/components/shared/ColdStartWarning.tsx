"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ColdStartWarning() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-400">
      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      <span>
        The ML backend is waking up (Render free tier). First request may take up to 30s — hang tight.
      </span>
    </div>
  );
}
