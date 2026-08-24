export type HexagonItem = 
  | { type: 'empty' } 
  | { type: 'text'; content: string } 
  | { type: 'dark'; variant: 'blue' | 'teal' } 
  | { type: 'image'; src: string; alt: string }; 

export const hexagonItems: HexagonItem[] = [ 
  // Ligne 1 
  { type: 'image', src: '/auth/hospital.png', alt: 'Graphisme et Social Media' }, 
  { type: 'dark', variant: 'blue' }, 
  { type: 'empty' }, 

  // Ligne 2 
  { type: 'image', src: '/auth/auth3.jpg', alt: 'Digital Marketing' }, 
  { type: 'image', src: '/auth/auth2.jpg', alt: 'Code sur ordinateur portable' }, 
  { type: 'empty' }, 

  // Ligne 3 
  { type: 'dark', variant: 'blue' }, 
  { type: 'image', src: '/auth/auth4.jpg', alt: 'Logos réseaux sociaux' }, 
  { type: 'text', content: 'Surveillance en temps réel' }, 
];