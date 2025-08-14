import { Sun } from "lucide-react";

export function UVIndex({ value = 1 }: { value?: number }) {
  return (
    <>
      <Sun className="h-6 w-6 text-yellow-300"/>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs text-yellow-200/80">UV Index</p>
    </>
  );
}
