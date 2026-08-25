import type { CSSProperties } from "react";
import Image from "next/image";
import type { HexagonItem } from "@/data/hexagons";

// Orientation Hexagone exacte : Pointe en haut & en bas (Flat sides left & right)
const HEX_CLIP: CSSProperties = {
  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
};

interface HexagonProps {
  item: HexagonItem;
}

export default function Hexagon({ item }: HexagonProps) {
  if (item.type === "empty") {
    return <div className="aspect-[0.866] w-full opacity-0 pointer-events-none" />;
  }

  return (
    <div className="group relative aspect-[0.866] w-full">
      <div className="absolute inset-0 overflow-hidden bg-bg-app/40" style={HEX_CLIP}>
        {/* --- Image --- */}
        {item.type === "image" ? (
          <>
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 100vw, 30vw"
              priority
              unoptimized
              className="object-cover brightness-[0.95] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-bg-app/20 transition-opacity duration-300 group-hover:bg-transparent" />
          </>
        ) : null}

        {/* --- Block Texte Bleu Principal --- */}
        {item.type === "text" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-primary p-4 text-center text-primary-foreground">
            {item.live ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                EN DIRECT
              </span>
            ) : null}
            <p className="mt-1 text-sm font-bold leading-tight md:text-base">
              {item.content}
            </p>
            {item.sub ? (
              <p className="text-[11px] font-medium text-primary-light">
                {item.sub}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* --- Hexagone Sombre / Motif --- */}
        {item.type === "dark" ? (
          <div className="absolute inset-0 bg-bg-app/80 backdrop-blur-md">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-2 rounded-full bg-primary/20 ring-4 ring-primary/10" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}