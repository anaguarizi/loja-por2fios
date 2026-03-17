import productBandana from '@/assets/product-bandana.jpg';
import productBucketHat from '@/assets/product-bucket-hat.jpg';
import productTop from '@/assets/product-top.jpg';
import productBolsa from '@/assets/product-bolsa.jpg';

export type ProductCategory = 'bandanas' | 'acessorios' | 'roupas' | 'decoracao' | 'personalizados';

export type ProductSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'unico';

export interface YarnType {
  id: string;
  name: string;
  colors: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  category: ProductCategory;
  image: string;
  sizes: ProductSize[];
  yarnType: YarnType;
  featured: boolean;
  customizable: boolean;
}

export const yarnTypes: YarnType[] = [
  {
    id: 'algodao-natural',
    name: 'Algodão Natural',
    colors: ['Cru', 'Branco Neve', 'Bege Areia', 'Marrom Café', 'Verde Sálvia', 'Rosa Antigo', 'Terracota'],
  },
  {
    id: 'fio-nautico',
    name: 'Fio Náutico',
    colors: ['Off-White', 'Areia', 'Oliva', 'Mostarda', 'Ferrugem', 'Azul Céu', 'Rosa Blush'],
  },
  {
    id: 'linha-anne',
    name: 'Linha Anne',
    colors: ['Branco', 'Creme', 'Rosa Bebê', 'Lilás', 'Verde Menta', 'Azul Hortênsia', 'Amarelo Manteiga'],
  },
  {
    id: 'barbante-premium',
    name: 'Barbante Premium',
    colors: ['Natural', 'Bege', 'Chocolate', 'Verde Musgo', 'Vinho', 'Grafite'],
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Bandana Brisa do Mar',
    slug: 'bandana-brisa-do-mar',
    description: 'Inspirada na leveza das ondas do mar capixaba, a Bandana Brisa do Mar é perfeita para os dias em que você quer um toque especial no visual. Confeccionada em algodão natural, traz um padrão delicado que combina com qualquer estilo. Cada peça é única, feita à mão com todo carinho e atenção aos detalhes.',
    shortDescription: 'Delicada bandana em crochê, perfeita para um look descontraído e cheio de charme.',
    price: 45.00,
    category: 'bandanas',
    image: productBandana,
    sizes: ['unico'],
    yarnType: yarnTypes[0],
    featured: true,
    customizable: true,
  },
  {
    id: '2',
    name: 'Bucket Hat Sol de Inverno',
    slug: 'bucket-hat-sol-de-inverno',
    description: 'O Bucket Hat Sol de Inverno é aquele acessório que une estilo e conforto em uma peça só. Feito em fio náutico, ele tem uma textura firme mas suave, ideal para passeios ao ar livre. Seu design atemporal combina com looks casuais e modernos. Um verdadeiro abraço de fio para sua cabeça.',
    shortDescription: 'Chapéu bucket em crochê com design atemporal e confortável.',
    price: 89.00,
    category: 'acessorios',
    image: productBucketHat,
    sizes: ['P', 'M', 'G'],
    yarnType: yarnTypes[1],
    featured: true,
    customizable: true,
  },
  {
    id: '3',
    name: 'Top Flor do Campo',
    slug: 'top-flor-do-campo',
    description: 'Leve como uma brisa de primavera, o Top Flor do Campo é uma peça que celebra a feminilidade e a liberdade. Confeccionado em linha Anne, tem um caimento delicado e um padrão floral sutil que encanta. Perfeito para dias quentes, festivais ou aquele encontro especial.',
    shortDescription: 'Top cropped floral em crochê, delicado e cheio de personalidade.',
    price: 120.00,
    category: 'roupas',
    image: productTop,
    sizes: ['PP', 'P', 'M', 'G'],
    yarnType: yarnTypes[2],
    featured: true,
    customizable: true,
  },
  {
    id: '4',
    name: 'Bolsa Caminho de Pedras',
    slug: 'bolsa-caminho-de-pedras',
    description: 'A Bolsa Caminho de Pedras é uma companheira fiel para o dia a dia. Feita em fio náutico resistente, tem espaço generoso e acabamento impecável. Seu design rústico e elegante carrega a essência do artesanal com a praticidade que você precisa. Cada ponto conta uma história.',
    shortDescription: 'Bolsa em crochê rústica e espaçosa, ideal para o dia a dia.',
    price: 159.00,
    category: 'acessorios',
    image: productBolsa,
    sizes: ['unico'],
    yarnType: yarnTypes[1],
    featured: true,
    customizable: false,
  },
  {
    id: '5',
    name: 'Colete Abraço Quentinho',
    slug: 'colete-abraco-quentinho',
    description: 'Como um abraço acolhedor nos dias mais frescos, o Colete Abraço Quentinho traz conforto e estilo em cada fio. Confeccionado em barbante premium, tem uma textura macia e um design que transita entre o casual e o sofisticado. Uma peça versátil que vai se tornar sua favorita.',
    shortDescription: 'Colete em crochê macio e aconchegante para os dias mais frescos.',
    price: 185.00,
    category: 'roupas',
    image: productBolsa,
    sizes: ['P', 'M', 'G', 'GG'],
    yarnType: yarnTypes[3],
    featured: false,
    customizable: true,
  },
  {
    id: '6',
    name: 'Porta-Copos Cantinho de Chá',
    slug: 'porta-copos-cantinho-de-cha',
    description: 'Transforme seus momentos de pausa em algo especial com os Porta-Copos Cantinho de Chá. Feitos em algodão natural, vêm em um conjunto de 4 peças com padrões delicados e únicos. Perfeitos para decorar sua mesa com charme artesanal e proteger suas superfícies com estilo.',
    shortDescription: 'Conjunto de 4 porta-copos em crochê, charme artesanal para sua mesa.',
    price: 55.00,
    category: 'decoracao',
    image: productBandana,
    sizes: ['unico'],
    yarnType: yarnTypes[0],
    featured: false,
    customizable: true,
  },
  {
    id: '7',
    name: 'Scrunchie Nó de Amor',
    slug: 'scrunchie-no-de-amor',
    description: 'O Scrunchie Nó de Amor é daqueles acessórios que fazem toda a diferença. Pequeno no tamanho, grande no charme. Feito em linha Anne com acabamento delicado, ele prende o cabelo sem marcar e adiciona um toque romântico ao seu visual. Disponível em diversas cores para combinar com tudo.',
    shortDescription: 'Scrunchie delicado em crochê para dar um toque especial ao cabelo.',
    price: 25.00,
    category: 'acessorios',
    image: productTop,
    sizes: ['unico'],
    yarnType: yarnTypes[2],
    featured: false,
    customizable: true,
  },
  {
    id: '8',
    name: 'Sousplat Trama da Casa',
    slug: 'sousplat-trama-da-casa',
    description: 'O Sousplat Trama da Casa transforma qualquer refeição em um evento especial. Confeccionado em barbante premium, tem um padrão elaborado que é pura arte. Cada peça é trabalhada com cuidado para garantir durabilidade e beleza. Ideal para quem ama receber com carinho.',
    shortDescription: 'Sousplat artesanal em crochê, elegância para suas refeições.',
    price: 42.00,
    category: 'decoracao',
    image: productBucketHat,
    sizes: ['unico'],
    yarnType: yarnTypes[3],
    featured: false,
    customizable: false,
  },
];

export const categories: { value: ProductCategory; label: string }[] = [
  { value: 'bandanas', label: 'Bandanas' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'roupas', label: 'Roupas' },
  { value: 'decoracao', label: 'Decoração' },
  { value: 'personalizados', label: 'Personalizados' },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};
