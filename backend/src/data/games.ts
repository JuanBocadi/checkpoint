import type { GameInput } from "../schemas/game.schema.js";

export const initialGames: GameInput[] = [
  {
    title: "Hollow Knight",
    genre: "Indie",
    platform: "Multiplataforma",
    releaseDate: "2017-02-24",
    price: 14.99,
    multiplayer: false,
    description:
      "Descendé a Hallownest, un reino de insectos olvidado. Explorá cavernas interconectadas, descubrí secretos y dominá combates precisos en una aventura dibujada a mano.",
  },
  {
    title: "Stardew Valley",
    genre: "Indie",
    platform: "Multiplataforma",
    releaseDate: "2016-02-26",
    price: 14.99,
    multiplayer: true,
    description:
      "Heredaste una granja y la oportunidad de empezar de nuevo. Cultivá, pescá, conocé a tus vecinos y construí tu propio ritmo de vida en el valle, solo o con amigos.",
  },
  {
    title: "Elden Ring",
    genre: "RPG",
    platform: "Multiplataforma",
    releaseDate: "2022-02-25",
    price: 59.99,
    multiplayer: true,
    description:
      "Recorré las Tierras Intermedias en una aventura de fantasía y exploración. Creá tu personaje, descubrí caminos inesperados y enfrentá desafíos que recompensan la perseverancia.",
  },
  {
    title: "Celeste",
    genre: "Indie",
    platform: "Multiplataforma",
    releaseDate: "2018-01-25",
    price: 19.99,
    multiplayer: false,
    description:
      "Ayudá a Madeline a escalar la montaña Celeste en una aventura de plataformas sobre la superación personal. Cada pantalla propone un desafío breve, preciso y lleno de posibilidades.",
  },
  {
    title: "Hades",
    genre: "Acción",
    platform: "Multiplataforma",
    releaseDate: "2020-09-17",
    price: 24.99,
    multiplayer: false,
    description:
      "Desafiá al dios de los muertos e intentá escapar del inframundo. Combiná las bendiciones del Olimpo mientras conocés a un elenco de personajes de la mitología griega.",
  },
  {
    title: "Portal 2",
    genre: "Aventura",
    platform: "PC",
    releaseDate: "2011-04-19",
    price: 9.99,
    multiplayer: true,
    description:
      "Resolvé cámaras de prueba con una pistola de portales y mucha creatividad. Explorá las instalaciones de Aperture Science en una campaña individual o en su modo cooperativo.",
  },
];
