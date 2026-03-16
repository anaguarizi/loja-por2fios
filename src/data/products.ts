import productTop from "../assets/product-top.jpg";
import productDress from "../assets/product-dress.jpg";
import productBag from "../assets/product-bag.jpg";
import productBikini from "../assets/product-bikini.jpg";
import productCardigan from "../assets/product-cardigan.jpg";
import productTableRunner from "../assets/hero-crochet.jpg";

export type MeasurementField = {
  id: string;
  label: string;
  description: string;
  videoUrl?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "roupa" | "acessorio" | "decoracao";
  description: string;
  available: boolean;
  customOrder: boolean;
  standardSizes?: string[];
  measurements?: MeasurementField[];
};

export const products: Product[] = [
  {
    id: "top-rendado",
    name: "Top Rendado",
    price: 120,
    image: productTop,
    category: "roupa",
    description: "Top delicado em crochê com padrão rendado, perfeito para o verão. Feito à mão com linha 100% algodão.",
    available: true,
    customOrder: true,
    measurements: [
      { id: "busto", label: "Circunferência do Busto", description: "Meça ao redor da parte mais larga do busto", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { id: "cintura", label: "Circunferência da Cintura", description: "Meça na parte mais estreita da cintura", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { id: "comprimento", label: "Comprimento desejado", description: "Do ombro até onde deseja que a peça termine", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  {
    id: "vestido-sage",
    name: "Vestido Sage",
    price: 350,
    image: productDress,
    category: "roupa",
    description: "Vestido elegante em crochê verde sage, manga 3/4, padrão aberto delicado. Ideal para ocasiões especiais.",
    available: false,
    customOrder: true,
    measurements: [
      { id: "busto", label: "Circunferência do Busto", description: "Meça ao redor da parte mais larga do busto", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { id: "cintura", label: "Circunferência da Cintura", description: "Meça na parte mais estreita da cintura", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { id: "quadril", label: "Circunferência do Quadril", description: "Meça na parte mais larga do quadril", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { id: "comprimento", label: "Comprimento desejado", description: "Do ombro até onde deseja que a peça termine", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  {
    id: "bolsa-rosa",
    name: "Bolsa Floral Rosé",
    price: 95,
    image: productBag,
    category: "acessorio",
    description: "Bolsa saco em crochê com detalhes florais, cor rosé. Perfeita para passeios e eventos ao ar livre.",
    available: true,
    customOrder: false,
  },
  {
    id: "biquini-terracotta",
    name: "Biquíni Terracotta",
    price: 180,
    image: productBikini,
    category: "roupa",
    description: "Conjunto de biquíni em crochê terracotta com detalhes florais em cru. Peça exclusiva feita à mão.",
    available: true,
    customOrder: true,
    standardSizes: ["PP", "P", "M", "G", "GG"],
  },
  {
    id: "cardigan-natural",
    name: "Cardigan Natural",
    price: 280,
    image: productCardigan,
    category: "roupa",
    description: "Cardigan aconchegante em crochê tom natural, com bolsos frontais. Peça atemporal para dias frescos.",
    available: true,
    customOrder: true,
    standardSizes: ["P", "M", "G", "GG"],
  },
  {
    id: "caminho-mesa",
    name: "Caminho de Mesa Rendado",
    price: 150,
    image: productTableRunner,
    category: "decoracao",
    description: "Caminho de mesa em crochê rendado branco, perfeito para dar um toque artesanal à sua mesa.",
    available: true,
    customOrder: true,
    standardSizes: ["1,0m", "1,5m", "2,0m"],
  },
];
