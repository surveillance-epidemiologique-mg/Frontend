import React, { CSSProperties } from 'react'; 
import Image from 'next/image'; 
import { HexagonItem } from '@/data/hexagons'; 

interface HexagonProps { 
  item: HexagonItem; 
} 

export default function Hexagon({ item }: HexagonProps) { 
  // Conserve le ratio 1:1 tout en s'étirant au maximum
  const baseHexStyles = "aspect-square w-full h-full relative group"; 

  const clipPathStyle: CSSProperties = { 
    clipPath: 'polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)', 
  }; 

  if (item.type === 'empty') { 
    return <div className="aspect-square w-full h-full opacity-0 pointer-events-none" />; 
  } 

  return ( 
    <div className={baseHexStyles}> 
      {/* Outer Hexagon (Bordure) */} 
      <div 
        className="absolute inset-1 bg-primary" 
        style={clipPathStyle} 
      > 
        {/* Inner Hexagon (Contenu) */} 
        <div 
          className="absolute inset-1 overflow-hidden" 
          style={clipPathStyle} 
        > 
          {item.type === 'image' && ( 
            <> 
              <Image 
                src={item.src} 
                alt={item.alt} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw" 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                priority={true} 
                unoptimized={true} 
              /> 
              <div className="absolute inset-0 z-10 bg-primary/10 transition-colors duration-500 group-hover:bg-transparent" /> 
            </> 
          )} 

          {item.type === 'text' && ( 
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary-active p-4 text-center text-primary-foreground md:p-8"> 
              <p className="text-base font-bold leading-snug tracking-tight drop-shadow-lg md:text-xl lg:text-2xl">
                {item.content}
              </p> 
            </div> 
          )} 

          {item.type === 'dark' && ( 
            <div className={`absolute inset-0 ${item.variant === 'blue' ? 'bg-gradient-to-br from-secondary to-secondary-hover' : 'bg-gradient-to-br from-chart-7 to-info'}`}> 
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"> 
                <div className="h-1.5 w-1/3 rounded-full bg-white/30" /> 
              </div> 
            </div> 
          )} 
        </div> 
      </div> 
    </div> 
  ); 
}