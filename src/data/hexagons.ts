export type HexagonItem =
  | { type: "empty" }
  | { type: "text"; content: string; sub?: string; live?: boolean }
  | { type: "dark" }
  | { type: "image"; src: string; alt: string };

export const hexagonItems: HexagonItem[] = [
  // Ligne 1
  { type: "dark" },
  { type: "image", src: "/auth/auth1.jpg", alt: "Lit d'hôpital" },
  { type: "image", src: "/auth/auth2.jpg", alt: "Chambre médicale" },

  // Ligne 2
  { type: "image", src: "/auth/auth3.jpg", alt: "Équipement médical" },
  { type: "image", src: "/auth/auth4.jpg", alt: "Consultation" },
  { type: "image", src: "/auth/auth5.jpg", alt: "Salle d'opération" },

  // Ligne 3
  {
    type: "text",
    content: "Surveillance Nationale",
    sub: "Uptime 99.9%",
    live: true,
  },
  { type: "image", src: "/auth/auth6.jpg", alt: "Équipe chirurgicale" },
  { type: "dark" },
];