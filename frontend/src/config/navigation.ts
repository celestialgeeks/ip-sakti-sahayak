/**
 * Centralized Navigation Configuration for IP-SAKTI Sahayak.
 * Single source of truth for navigation links across Desktop (Sidebar) and Mobile (MobileNav).
 *
 * If you ever rename a label (e.g., 'TKDL Registry' to 'Ayurvedic Library'),
 * you only need to change it here! Tests check functional routes and IDs,
 * so label changes will never break automated testing.
 */

export interface NavItemConfig {
  id: "formulation-lab" | "tkdl" | "patents" | "rules";
  label: string;
  href: string;
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  {
    id: "tkdl",
    label: "Ayurvedic Library",
    href: "/tkdl",
  },
  {
    id: "formulation-lab",
    label: "Formulation Lab",
    href: "/formulation-lab",
  },
  {
    id: "patents",
    label: "Patent Database & Search",
    href: "/patents",
  },
  {
    id: "rules",
    label: "Latest Rules & Regulations",
    href: "/rules",
  },
];


