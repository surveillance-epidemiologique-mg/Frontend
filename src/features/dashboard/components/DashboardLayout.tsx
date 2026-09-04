// Layout local de la page Dashboard.
// Le shell visuel (header fixe + sidebar) est appliqué UNE fois au niveau du
// layout du groupe `(dashboard)` (src/app/(dashboard)/layout.tsx) pour que
// toutes les pages en bénéficient. Ce composant ne fait donc que passer les
// enfants : le re-rendre ici produirait un double header/sidebar.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}