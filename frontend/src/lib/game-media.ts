// Imágenes de las fichas oficiales de Steam. Procedencia en docs/imagenes.md.
export interface GameMedia {
  slug: string;
  cover: string;
  hero: string;
  screenshots: string[];
  studio: string;
  source: string;
  tags: string[];
  headline: string;
  copy: string;
}

export const gameMedia: Record<string, GameMedia> = {
  "hollow knight": {
    slug: "hollow-knight",
    cover: "/images/games/hollow-knight-cover.jpg",
    hero: "/images/games/hollow-knight-hero.jpg",
    screenshots: [
      "/images/games/hollow-knight-scene-1.jpg",
      "/images/games/hollow-knight-scene-2.jpg",
    ],
    studio: "Team Cherry",
    source: "https://store.steampowered.com/app/367520/",
    tags: ["Metroidvania", "Exploración", "Dibujado a mano"],
    headline: "Un reino olvidado. Una aventura inolvidable.",
    copy: "Descendé a Hallownest y encontrá belleza, secretos y desafíos debajo de la superficie.",
  },
  "stardew valley": {
    slug: "stardew-valley",
    cover: "/images/games/stardew-valley-cover.jpg",
    hero: "/images/games/stardew-valley-hero.jpg",
    screenshots: [
      "/images/games/stardew-valley-scene-1.jpg",
      "/images/games/stardew-valley-scene-2.jpg",
    ],
    studio: "ConcernedApe",
    source: "https://store.steampowered.com/app/413150/",
    tags: ["Vida en la granja", "Cooperativo", "A tu ritmo"],
    headline: "Bajá un cambio. Empezá una nueva vida.",
    copy: "Una pequeña granja, un pueblo por conocer y toda la libertad para hacer las cosas a tu manera.",
  },
  "elden ring": {
    slug: "elden-ring",
    cover: "/images/games/elden-ring-cover.jpg",
    hero: "/images/games/elden-ring-hero.jpg",
    screenshots: [
      "/images/games/elden-ring-scene-1.jpg",
      "/images/games/elden-ring-scene-2.jpg",
    ],
    studio: "FromSoftware, Inc.",
    source: "https://store.steampowered.com/app/1245620/",
    tags: ["Mundo abierto", "Fantasía oscura", "RPG"],
    headline: "Hay mundos que vale la pena descubrir.",
    copy: "Perdete en las Tierras Intermedias. Explorá sin un camino marcado y hacé tuya cada victoria.",
  },
  celeste: {
    slug: "celeste",
    cover: "/images/games/celeste-cover.jpg",
    hero: "/images/games/celeste-hero.jpg",
    screenshots: [
      "/images/games/celeste-scene-1.jpg",
      "/images/games/celeste-scene-2.jpg",
    ],
    studio: "Maddy Makes Games Inc. / Extremely OK Games, Ltd.",
    source: "https://store.steampowered.com/app/504230/",
    tags: ["Plataformas", "Precisión", "Superación"],
    headline: "La próxima cima está más cerca.",
    copy: "Un salto a la vez. Acompañá a Madeline en una aventura tan desafiante como personal.",
  },
  hades: {
    slug: "hades",
    cover: "/images/games/hades-cover.jpg",
    hero: "/images/games/hades-hero.jpg",
    screenshots: [
      "/images/games/hades-scene-1.jpg",
      "/images/games/hades-scene-2.jpg",
    ],
    studio: "Supergiant Games",
    source: "https://store.steampowered.com/app/1145360/",
    tags: ["Roguelike", "Mitología griega", "Acción"],
    headline: "Una partida más. Una nueva oportunidad.",
    copy: "Desafiá al inframundo, combiná las bendiciones del Olimpo y volvé a intentarlo a tu manera.",
  },
  "portal 2": {
    slug: "portal-2",
    cover: "/images/games/portal-2-cover.jpg",
    hero: "/images/games/portal-2-hero.jpg",
    screenshots: [
      "/images/games/portal-2-scene-1.jpg",
      "/images/games/portal-2-scene-2.jpg",
    ],
    studio: "Valve",
    source: "https://store.steampowered.com/app/620/",
    tags: ["Puzles", "Cooperativo", "Ciencia ficción"],
    headline: "Pensá fuera de este mundo.",
    copy: "Dos portales, infinitas posibilidades. Resolvé las pruebas de Aperture Science con ingenio y compañía.",
  },
};

export function getGameMedia(title: string): GameMedia | undefined {
  return gameMedia[title.trim().toLocaleLowerCase("es")];
}
