import { cn } from "@/lib/utils";
import Image from "next/image";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** État de chargement partagé pour les listes et tableaux. */
export function LoadingState({
  label = "Chargement des données…",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <Image
        src="/images/Loading.svg"
        alt=""
        width={160}
        height={160}
        priority
        className="size-36 object-contain sm:size-40"
      />
      <p className="text-sm font-medium text-text-muted">{label}</p>
    </div>
  );
}
