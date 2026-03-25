// ===== ITEM ICON RESOLVER =====
// Returns the correct Lucide icon component based on item type and subtype.

import {
  Swords,
  Axe,
  Hammer,
  Wand2,
  Crosshair,
  ShieldCheck,
  Crown,
  Footprints,
  CircleDot,
  Gem,
  FlaskConical,
  Package,
  Hand,
  Sword,
} from "lucide-react";

// Subtype -> icon
const SUBTYPE_ICONS = {
  sword:    Sword,
  axe:      Axe,
  mace:     Hammer,
  staff:    Wand2,
  wand:     Wand2,
  bow:      Crosshair,
  crossbow: Crosshair,
  dagger:   Sword,
  blade:    Swords,
  heavy:    ShieldCheck,
  medium:   ShieldCheck,
  light:    ShieldCheck,
};

// Type -> fallback icon (when no subtype)
const TYPE_ICONS = {
  weapon:     Swords,
  armor:      ShieldCheck,
  helmet:     Crown,
  gloves:     Hand,
  boots:      Footprints,
  ring:       CircleDot,
  amulet:     Gem,
  consumable: FlaskConical,
  material:   Package,
};

/**
 * Returns the correct icon component for an item.
 * Weapon subtypes get specialized icons (sword/dagger=Sword, axe=Axe, mace=Hammer,
 * staff/wand=Wand2, bow/crossbow=Crosshair, blade=Swords).
 */
export function getItemIcon(item) {
  if (!item) return Package;
  if (item.subtype && SUBTYPE_ICONS[item.subtype]) {
    return SUBTYPE_ICONS[item.subtype];
  }
  return TYPE_ICONS[item.type] || Package;
}

export { TYPE_ICONS, SUBTYPE_ICONS };