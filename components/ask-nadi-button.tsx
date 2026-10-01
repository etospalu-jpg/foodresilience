"use client";

import { Sparkles } from "lucide-react";

export function AskNadiButton({
  prompt,
  label = "Ask NADI",
  className = "secondary-button",
}: {
  prompt: string;
  label?: string;
  className?: string;
}) {
  function open() {
    window.dispatchEvent(new CustomEvent("nadi:ask", { detail: { prompt } }));
  }
  return <button type="button" className={className} onClick={open}><Sparkles size={15}/>{label}</button>;
}
