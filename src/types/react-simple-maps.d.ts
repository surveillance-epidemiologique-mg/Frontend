declare module "react-simple-maps" {
  import type * as React from "react";

  export interface Geography {
    rsmKey: string;
    properties: Record<string, unknown>;
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (data: {
      geographies: Geography[];
    }) => React.ReactNode;
  }

  export interface GeographyProps {
    geography: Geography;
    onClick?: (event: unknown) => void;
    style?: Record<string, React.CSSProperties>;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const ZoomableGroup: React.FC<{
    center?: [number, number];
    zoom?: number;
    children?: React.ReactNode;
  }>;
  export const Marker: React.FC<{
    coordinates: [number, number];
    children?: React.ReactNode;
  }>;
  export const Annotation: React.FC<{
    subject: [number, number];
    children?: React.ReactNode;
    dx?: number;
    dy?: number;
  }>;
  export const Graticule: React.FC<Record<string, unknown>>;
}