// The Wix store has 31 overlapping categories; visitors see these 14 plant beds instead.
export const GROUPS = [
  { id: "hedging", label: "Hedging", cats: ["Hedging (small - up to 1m)", "Hedging (medium - 1m-2m)", "Hedging (large - 2m+)"] },
  { id: "natives", label: "Natives", cats: ["Natives"] },
  { id: "indoor", label: "Indoor", cats: ["Indoor"] },
  { id: "trees", label: "Trees", cats: ["Trees", "Pines & Conifers"] },
  { id: "palms", label: "Palms & tropical", cats: ["Palms", "Tropical", "Bamboo & Alternatives", "Cordylines & Yuccas"] },
  { id: "shrubs", label: "Shrubs", cats: ["Shrubs", "Shrubs (small)"] },
  { id: "grasses", label: "Grasses & groundcovers", cats: ["Flaxes & Grasses", "Ground Covers"] },
  { id: "succulents", label: "Succulents", cats: ["Succulents"] },
  { id: "climbers", label: "Climbers & green walls", cats: ["Climbers", "Vertical Gardens"] },
  { id: "edible", label: "Fruit & herbs", cats: ["Fruiting", "Herbs & Vegetables"] },
  { id: "waterwise", label: "Water wise", cats: ["Water Wise (Super Tough)"] },
  { id: "coastal", label: "Coastal", cats: ["Coastal"] },
  { id: "advanced", label: "Advanced plants", cats: ["Advanced Plants"] },
  { id: "supplies", label: "Pots & supplies", cats: ["Pottery", "Stone", "Shade Cloth & Accessories", "Garden Maintenance", "Artificial Turf & Accessories"] },
];

// Height sub-beds shown when Hedging is open.
export const HEDGE_SIZES = [
  { id: "small", label: "Up to 1 m", cat: "Hedging (small - up to 1m)" },
  { id: "medium", label: "1–2 m", cat: "Hedging (medium - 1m-2m)" },
  { id: "large", label: "2 m +", cat: "Hedging (large - 2m+)" },
];

export const groupById = (id) => GROUPS.find((g) => g.id === id);

export function inGroup(product, groupId, sizeId) {
  const g = groupById(groupId);
  if (!g) return true;
  if (groupId === "hedging" && sizeId) {
    const size = HEDGE_SIZES.find((s) => s.id === sizeId);
    return size ? product.categories.includes(size.cat) : true;
  }
  return product.categories.some((c) => g.cats.includes(c));
}
