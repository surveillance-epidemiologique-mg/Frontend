import type { Zone } from "@/types/auth";
import type { RegionOption } from "@/features/settings/components/user-form-modal";

export function buildRegions(zones: Zone[]): RegionOption[] {
  return zones
    .filter((z) => z.type === "Region")
    .map((region) => ({
      id: region.id,
      name: region.name,
      districts: zones
        .filter((z) => z.type === "District" && z.parentId === region.id)
        .map((d) => ({ id: d.id, name: d.name })),
    }));
}