import { Loader2 } from "lucide-react";
import React from "react";

export default function AuthFormButton({
  label,
  isLoading,
  className,
  text
}: {
  label: string;
  isLoading: boolean;
  className?: string
  text: string;
}) {
  return (
    <button
      className={`flex items-center justify-center py-2 px-20 
        w-full border border-gray-400 text-secondary
        bg-primary hover:bg-primary/80 
        transition ease-in duration-200
        text-center font-semibold 
        shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg ${className}`}
      type="submit"
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}
      <span className="ml-2">{text}</span>
    </button>
  );
}
