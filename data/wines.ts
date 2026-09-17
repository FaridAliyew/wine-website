export interface WineData {
  id: number;
  slug: string;
  name: string;
  vintage: string;
  appellation: string;
  region: string;
  bgImage: string;
  bottleImage: string;
  /** Colour of the wine in the glass, used by the pour transition */
  wineColor: string;
  tagline: string;
  description: string;
  tastingNotes: {
    nose: string;
    palate: string;
    finish: string;
  };
  technicalDetails: {
    varietal: string;
    alcohol: string;
    aging: string;
    production: string;
    servingTemp: string;
    soilType: string;
    altitude: string;
    harvest: string;
  };
  foodPairing: string[];
}

export const WINES: WineData[] = [
  {
    id: 1,
    slug: "auris-reserve",
    name: "Auris Reserve",
    vintage: "2018",
    appellation: "Cabernet Sauvignon Grand Cru",
    region: "Tovuz, Foothills of the Lesser Caucasus",
    bgImage: "/images/bg-wine1.jpg",
    bottleImage: "/images/wine1-clean.png",
    wineColor: "#4A0A14",
    tagline: "The Crown Jewel · 24 Months in French Oak Barriques",
    description:
      "Crafted from 45-year-old vines rooted deeply in ancient limestone and riverbed gravel. Hand-harvested at dawn, fermented with indigenous yeasts in raw concrete vats, and patient aged for 24 months in medium-toast French oak barriques. Unfiltered and bottled under waxing seal.",
    tastingNotes: {
      nose: "Dark blackberry compote, crushed violets, dried tobacco leaf, and subtle whispers of smoked cedar and dark cocoa.",
      palate: "Monumental depth with fine-grained velvety tannins. Ripe blackcurrant, graphite minerality, and savory dark cherry.",
      finish: "Enduring and noble, lingering for over sixty seconds with elegant acidity and warm spice notes.",
    },
    technicalDetails: {
      varietal: "100% Cabernet Sauvignon",
      alcohol: "14.5% Vol.",
      aging: "24 Months in French Oak (70% New)",
      production: "1,200 Individually Numbered Bottles",
      servingTemp: "16°C – 18°C (Decant 45 mins)",
      soilType: "Limestone, Alluvial Gravel & Clay Loam",
      altitude: "650 meters above sea level",
      harvest: "Manual selection in 12kg crates",
    },
    foodPairing: [
      "Dry-aged prime ribeye with truffled jus",
      "Roasted venison saddle with juniper glaze",
      "Aged 36-month Comté & Roquefort",
    ],
  },
  {
    id: 2,
    slug: "magnus",
    name: "Château Magnus",
    vintage: "2019",
    appellation: "Syrah Reserve",
    region: "Tovuz, South-Facing Terraces",
    bgImage: "/images/bg-wine2.jpg",
    bottleImage: "/images/wine2-clean.png",
    wineColor: "#3B0A1E",
    tagline: "Robust Power & Aristocratic Elegance",
    description:
      "Grown on steep sun-drenched terrace slopes where warm days meet chilly mountain nights. Demonstrates classical Syrah intensity with aromatic pepperiness, deep concentration, and silky textural grip after 20 months maturation in oak barrels.",
    tastingNotes: {
      nose: "Cracked black peppercorn, ripe damson plum, smoked game, and delicate garrigue herbs.",
      palate: "Rich and structured. Layers of wild blueberry, black olive tapenade, licorice, and espresso roast.",
      finish: "Long and harmonic with polished mineral tannins and a touch of savory leather.",
    },
    technicalDetails: {
      varietal: "100% Syrah",
      alcohol: "14.2% Vol.",
      aging: "20 Months in French Oak Barriques",
      production: "2,400 Bottles",
      servingTemp: "16°C – 18°C",
      soilType: "Decomposed Granite & Schist",
      altitude: "580 meters above sea level",
      harvest: "Handpicked in early October",
    },
    foodPairing: [
      "Braised lamb shanks with rosemary reduction",
      "Grilled duck breast with dark cherry compote",
      "Wild mushroom and truffle risotto",
    ],
  },
  {
    id: 3,
    slug: "luna-verde",
    name: "Domaine Luna Verde",
    vintage: "2021",
    appellation: "Sauvignon Blanc Grand Cru",
    region: "Tovuz, Tovuzchay River Terrace",
    bgImage: "/images/bg-wine3.jpg",
    bottleImage: "/images/wine3-clean.png",
    wineColor: "#E3D9A0",
    tagline: "Pure Minerality & Morning Mist Radiance",
    description:
      "Cultivated alongside cool riverbanks where morning mists shield the grapes from harsh afternoon sun, preserving crystalline natural acidity and delicate botanical perfumes. Cold-fermented in stainless steel with 6 months sur lie aging.",
    tastingNotes: {
      nose: "Crisp white peach, green apple, elderflower, lemongrass, and crushed riverbed flint.",
      palate: "Vibrant and laser-focused. Zesty pink grapefruit, lime zest, subtle honeydew, and clean saline minerality.",
      finish: "Pristine, refreshing, and persistent with energetic citrus tension.",
    },
    technicalDetails: {
      varietal: "100% Sauvignon Blanc",
      alcohol: "13.0% Vol.",
      aging: "6 Months on Fine Lees in Stainless Steel",
      production: "3,600 Bottles",
      servingTemp: "8°C – 10°C",
      soilType: "Riverbed Silt, River Pebbles & Chalk",
      altitude: "510 meters above sea level",
      harvest: "Pre-dawn manual harvest",
    },
    foodPairing: [
      "Fresh Normandy oysters with mignonette",
      "Pan-seared Dover sole meunière",
      "Artisanal goat cheeses (Chavignol)",
    ],
  },
  {
    id: 4,
    slug: "terra-nobile",
    name: "Terra Nobile",
    vintage: "2020",
    appellation: "Merlot Grand Cuvée",
    region: "Tovuz, Sun-Drenched Plateau",
    bgImage: "/images/bg-wine4.jpg",
    bottleImage: "/images/wine4-clean.png",
    wineColor: "#6B0F1A",
    tagline: "Opulent Warmth & Velvety Softness",
    description:
      "Born from high clay-limestone parcels that retain summer heat, allowing Merlot grapes to reach sublime phenolic ripeness. Rich, supple, and lavishly aromatic with 18 months of maturation in fine-grain French oak barriques.",
    tastingNotes: {
      nose: "Black cherry compote, Madagascar vanilla bean, toasted brioche, and sweet baking spices.",
      palate: "Silky, mouth-coating, and opulent. Lush plum, mocha, boysenberry, and warm tobacco notes.",
      finish: "Velvety, rounded, and opulent with gentle, melting tannins.",
    },
    technicalDetails: {
      varietal: "90% Merlot, 10% Petit Verdot",
      alcohol: "14.0% Vol.",
      aging: "18 Months in French Oak (50% New)",
      production: "1,800 Bottles",
      servingTemp: "16°C – 18°C",
      soilType: "Deep Blue Clay & Limestone",
      altitude: "620 meters above sea level",
      harvest: "Mid-September manual sorting",
    },
    foodPairing: [
      "Roasted rack of veal with wild mushrooms",
      "Slow-cooked beef cheek Bourguignon",
      "Truffled polenta with aged Parmigiano-Reggiano",
    ],
  },
  {
    id: 5,
    slug: "solis-blanc",
    name: "Domaine Solis Blanc",
    vintage: "2022",
    appellation: "Chardonnay Grand Cru",
    region: "Tovuz, High Plateau",
    bgImage: "/images/bg-wine5.jpg",
    bottleImage: "/images/wine5-clean.png",
    wineColor: "#D4A93F",
    tagline: "Golden Brilliance & Burgundian Texture",
    description:
      "A golden monument of craftsmanship. Whole-cluster pressed and barrel-fermented with indigenous yeasts, followed by 12 months in French oak barrels with weekly bâttonage (lees stirring), producing a wine of extraordinary richness and aristocratic finesse.",
    tastingNotes: {
      nose: "Meyer lemon curd, roasted hazelnut, white acacia blossom, beeswax, and vanilla custard.",
      palate: "Creamy, multi-layered, and expansive. Golden delicious apple, butterscotch, subtle brioche, and vibrant flinty acid.",
      finish: "Sensuous and long with lingering mineral salinity and toasted almond undertones.",
    },
    technicalDetails: {
      varietal: "100% Chardonnay",
      alcohol: "13.5% Vol.",
      aging: "12 Months in French Oak (40% New) with Bâttonage",
      production: "1,500 Bottles",
      servingTemp: "10°C – 12°C",
      soilType: "Limestone Chalk & Calcareous Marl",
      altitude: "700 meters above sea level",
      harvest: "Hand-harvested at optimal balance",
    },
    foodPairing: [
      "Butter-poached Brittany lobster with lemon emulsion",
      "Pan-roasted Turbot with beurre blanc",
      "Roasted Bresse chicken with morel cream sauce",
    ],
  },
];

export function getWineBySlug(slug: string): WineData | undefined {
  return WINES.find((w) => w.slug === slug);
}

export function getAllWineSlugs(): string[] {
  return WINES.map((w) => w.slug);
}
