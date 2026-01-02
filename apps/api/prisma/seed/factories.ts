import { faker } from '@faker-js/faker/locale/pt_BR';
import * as bcrypt from 'bcrypt';
import type { PackStatus, PurchaseStatus, UserType, WithdrawalStatus } from '@prisma/client';

// Set a consistent seed for reproducible data
faker.seed(42);

// Demo account constants
export const DEMO_PASSWORD = 'Demo123!';
export const DEMO_PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 12);

export interface UserSeedData {
  email: string;
  passwordHash: string;
  displayName: string;
  slug: string;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  birthDate: Date;
  userType: UserType;
  emailVerified: boolean;
  stripeAccountId: string | null;
  stripeConnected: boolean;
}

export interface PackSeedData {
  creatorId: string;
  title: string;
  description: string;
  price: number;
  status: PackStatus;
  publishedAt: Date | null;
}

export interface PackPreviewSeedData {
  packId: string;
  url: string;
  order: number;
}

export interface PackFileSeedData {
  packId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  order: number;
}

export interface PurchaseSeedData {
  userId: string;
  packId: string;
  creatorId: string;
  amount: number;
  platformFee: number;
  creatorEarnings: number;
  stripePaymentIntentId: string;
  status: PurchaseStatus;
  availableAt: Date;
  refundedAt: Date | null;
}

export interface WithdrawalSeedData {
  creatorId: string;
  amount: number;
  stripePayoutId: string | null;
  status: WithdrawalStatus;
  requestedAt: Date;
  processedAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
}

export interface DownloadLogSeedData {
  userId: string;
  fileId: string;
  packId: string;
  dateKey: string;
  count: number;
  ipAddress: string;
  userAgent: string;
}

// Generate a valid 18+ birth date
function generateAdultBirthDate(): Date {
  const today = new Date();
  const minAge = 18;
  const maxAge = 45;
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  return faker.date.between({ from: minDate, to: maxDate });
}

// Generate URL-safe slug from name
function generateSlug(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${index}`;
}

// Sensual/adult themed pack titles and descriptions
const PACK_THEMES = [
  {
    title: 'Noite de Luxúria',
    description: 'Uma coleção exclusiva de fotos sensuais em ambiente intimista. Lingerie premium, iluminação suave e poses provocantes que vão te deixar sem fôlego.',
  },
  {
    title: 'Ensaio Boudoir Deluxe',
    description: 'Sessão fotográfica profissional em estilo boudoir. Cada foto captura a essência da sensualidade feminina com elegância e ousadia.',
  },
  {
    title: 'Fantasias Secretas Vol.1',
    description: 'Realizando suas fantasias mais íntimas através de fotos e vídeos exclusivos. Conteúdo premium para assinantes exigentes.',
  },
  {
    title: 'Red Room Experience',
    description: 'Entre no meu quarto vermelho. Fotos sensuais com temática provocante, lingerie vermelha e poses que vão incendiar sua imaginação.',
  },
  {
    title: 'Midnight Collection',
    description: 'Conteúdo exclusivo capturado nas horas mais íntimas da noite. Sensualidade pura em cada frame.',
  },
  {
    title: 'Wet & Wild',
    description: 'Ensaio aquático sensual. Gotas de água, pele bronzeada e poses irresistíveis em um cenário paradisíaco.',
  },
  {
    title: 'Silk & Lace',
    description: 'A suavidade da seda encontra a ousadia da renda. Uma coleção refinada para quem aprecia lingerie de alta qualidade.',
  },
  {
    title: 'Body Art Sensual',
    description: 'Corpo como tela, arte como expressão. Pinturas corporais sensuais em poses artísticas que celebram a beleza feminina.',
  },
  {
    title: 'Private Dancer',
    description: 'Performances exclusivas de dança sensual. Vídeos em alta definição que vão te prender do início ao fim.',
  },
  {
    title: 'Golden Hour Goddess',
    description: 'Capturada na luz dourada do pôr do sol. Fotos sensuais em ambiente natural com uma vibe romântica e provocante.',
  },
  {
    title: 'Neon Dreams',
    description: 'Ensaio com iluminação neon vibrante. Cores intensas, sombras sensuais e uma atmosfera cyberpunk irresistível.',
  },
  {
    title: 'Intimidade Revelada',
    description: 'Um olhar íntimo e autêntico. Fotos sensuais que capturam momentos de vulnerabilidade e desejo.',
  },
  {
    title: 'Espelho da Sedução',
    description: 'Reflexos do desejo. Ensaio sensual com espelhos criando composições únicas e provocantes.',
  },
  {
    title: 'Tropical Heat',
    description: 'Calor tropical, pele dourada e muito sensualidade. Ensaio em locação paradisíaca com clima de verão eterno.',
  },
  {
    title: 'After Dark',
    description: 'O que acontece após o anoitecer fica entre nós. Conteúdo exclusivo e provocante para noites especiais.',
  },
];

// Draft-specific themes (work in progress packs)
const DRAFT_THEMES = [
  {
    title: '[RASCUNHO] Ensaio de Inverno',
    description: 'Em produção: ensaio com tema invernal, cores frias e lingerie branca.',
  },
  {
    title: '[WIP] Luzes da Cidade',
    description: 'Trabalho em progresso: ensaio urbano noturno com luzes de néon.',
  },
  {
    title: '[DRAFT] Sessão Artística',
    description: 'Rascunho de ensaio com foco artístico e poses criativas.',
  },
  {
    title: '[EM EDIÇÃO] Charme Vintage',
    description: 'Ensaio com estética retrô, ainda em fase de edição.',
  },
  {
    title: '[PENDENTE] Coleção Especial',
    description: 'Pack especial em preparação para lançamento.',
  },
  {
    title: '[PREVIEW] Novo Projeto',
    description: 'Prévia do próximo grande projeto. Em breve!',
  },
];

const CREATOR_NAMES = [
  'Sofia Bela',
  'Valentina Rose',
  'Isabella Noir',
  'Luna Desire',
  'Scarlett Flame',
  'Jade Mystique',
  'Aurora Bliss',
  'Mia Velvet',
  'Lara Sensual',
  'Natasha Wild',
  'Carmen Luxe',
  'Bianca Heaven',
];

const BUYER_NAMES = [
  'Pedro Santos',
  'Lucas Oliveira',
  'Gabriel Silva',
  'Rafael Costa',
  'Bruno Almeida',
  'Matheus Ferreira',
  'Thiago Rodrigues',
  'Felipe Lima',
  'Gustavo Martins',
  'André Souza',
  'Marcelo Dias',
  'Ricardo Pereira',
];

const FILE_TEMPLATES = [
  { name: 'foto_exclusiva_{n}.jpg', mime: 'image/jpeg', minSize: 2_000_000, maxSize: 8_000_000 },
  { name: 'ensaio_completo_{n}.jpg', mime: 'image/jpeg', minSize: 3_000_000, maxSize: 10_000_000 },
  { name: 'video_preview_{n}.mp4', mime: 'video/mp4', minSize: 20_000_000, maxSize: 80_000_000 },
  { name: 'behind_scenes_{n}.mp4', mime: 'video/mp4', minSize: 15_000_000, maxSize: 50_000_000 },
  { name: 'bonus_content_{n}.jpg', mime: 'image/jpeg', minSize: 1_500_000, maxSize: 5_000_000 },
  { name: 'set_especial_{n}.zip', mime: 'application/zip', minSize: 50_000_000, maxSize: 100_000_000 },
  { name: 'foto_artistica_{n}.png', mime: 'image/png', minSize: 4_000_000, maxSize: 12_000_000 },
  { name: 'clipe_sensual_{n}.mp4', mime: 'video/mp4', minSize: 30_000_000, maxSize: 90_000_000 },
];

// Factory functions
export function createDemoCreator(index: number): UserSeedData {
  const name = CREATOR_NAMES[index % CREATOR_NAMES.length];
  const slug = generateSlug(name, index + 1);

  return {
    email: index === 0 ? 'creator_demo@local.test' : `creator${index + 1}@local.test`,
    passwordHash: DEMO_PASSWORD_HASH,
    displayName: name,
    slug,
    bio: faker.lorem.paragraph(2),
    profileImage: `avatars/avatar_${String((index % 20) + 1).padStart(2, '0')}.jpg`,
    coverImage: `covers/cover_${String((index % 15) + 1).padStart(2, '0')}.jpg`,
    birthDate: generateAdultBirthDate(),
    userType: 'creator' as UserType,
    emailVerified: index < 8, // Most creators are verified
    stripeAccountId: index < 8 ? `acct_demo_${slug}` : null,
    stripeConnected: index < 8,
  };
}

export function createDemoBuyer(index: number): UserSeedData {
  const name = BUYER_NAMES[index % BUYER_NAMES.length];
  const slug = generateSlug(name, index + 100);

  return {
    email: index === 0 ? 'buyer_demo@local.test' : `buyer${index + 1}@local.test`,
    passwordHash: DEMO_PASSWORD_HASH,
    displayName: name,
    slug,
    bio: null,
    profileImage: `avatars/avatar_${String(((index + 10) % 20) + 1).padStart(2, '0')}.jpg`,
    coverImage: null,
    birthDate: generateAdultBirthDate(),
    userType: 'consumer' as UserType,
    emailVerified: index < 6,
    stripeAccountId: null,
    stripeConnected: false,
  };
}

export function createPack(
  creatorId: string,
  index: number,
  status: PackStatus = 'published'
): PackSeedData {
  // Use different themes for drafts vs published packs
  const theme = status === 'draft'
    ? DRAFT_THEMES[index % DRAFT_THEMES.length]
    : PACK_THEMES[index % PACK_THEMES.length];

  const basePrice = 1990 + Math.floor(Math.random() * 3000) * 10; // R$ 19.90 - R$ 49.90 range

  const now = new Date();
  const publishedAt = status === 'published'
    ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
    : null;

  return {
    creatorId,
    title: theme.title,
    description: theme.description,
    price: Math.min(basePrice, 50000), // Cap at R$ 500
    status,
    publishedAt,
  };
}

// Generate a simple colored placeholder SVG as data URL
function generatePlaceholderDataUrl(index: number): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF69B4', '#00CED1', '#FFD700', '#9370DB',
  ];
  const color = colors[index % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="${color}" width="400" height="400"/><text x="200" y="200" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">Preview ${index + 1}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function createPackPreviews(packId: string, packIndex: number): PackPreviewSeedData[] {
  const previewCount = 3; // Always 3 previews per pack
  const previews: PackPreviewSeedData[] = [];

  for (let i = 0; i < previewCount; i++) {
    const previewIndex = (packIndex * 4 + i) % 40 + 1;
    previews.push({
      packId,
      url: generatePlaceholderDataUrl(previewIndex),
      order: i,
    });
  }

  return previews;
}

export function createPackFiles(packId: string, packIndex: number): PackFileSeedData[] {
  const fileCount = 10 + Math.floor(Math.random() * 5); // 10-14 files per pack
  const files: PackFileSeedData[] = [];

  for (let i = 0; i < fileCount; i++) {
    const template = FILE_TEMPLATES[i % FILE_TEMPLATES.length];
    const filename = template.name.replace('{n}', String(i + 1).padStart(2, '0'));
    const size = Math.floor(Math.random() * (template.maxSize - template.minSize) + template.minSize);

    files.push({
      packId,
      filename,
      mimeType: template.mime,
      size,
      storageKey: `packs/${packId}/files/${filename}`,
      order: i,
    });
  }

  return files;
}

export function createPurchase(
  userId: string,
  packId: string,
  creatorId: string,
  packPrice: number,
  index: number
): PurchaseSeedData {
  const now = new Date();

  // Mix of purchase dates - some older (available), some recent (pending)
  const daysAgo = Math.floor(Math.random() * 30);
  const purchaseDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  // Calculate 14-day availability
  const availableAt = new Date(purchaseDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Occasionally mark as refunded
  const isRefunded = index % 12 === 11;
  const status: PurchaseStatus = isRefunded ? 'refunded' : 'paid';

  const platformFee = Math.floor(packPrice * 0.2); // 20%
  const creatorEarnings = packPrice - platformFee;

  return {
    userId,
    packId,
    creatorId,
    amount: packPrice,
    platformFee,
    creatorEarnings,
    stripePaymentIntentId: `pi_demo_${Date.now()}_${index}`,
    status,
    availableAt,
    refundedAt: isRefunded ? new Date(purchaseDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
  };
}

export function createWithdrawal(
  creatorId: string,
  index: number
): WithdrawalSeedData {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 60);
  const requestedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const statuses: WithdrawalStatus[] = ['completed', 'completed', 'completed', 'processing', 'pending', 'failed'];
  const status = statuses[index % statuses.length];

  // Amount between R$ 50 and R$ 500
  const amount = 5000 + Math.floor(Math.random() * 45000);

  let processedAt: Date | null = null;
  let failedAt: Date | null = null;
  let failureReason: string | null = null;

  if (status === 'completed') {
    processedAt = new Date(requestedAt.getTime() + 2 * 24 * 60 * 60 * 1000);
  } else if (status === 'failed') {
    failedAt = new Date(requestedAt.getTime() + 1 * 24 * 60 * 60 * 1000);
    failureReason = 'Dados bancários inválidos';
  }

  return {
    creatorId,
    amount,
    stripePayoutId: status === 'completed' ? `po_demo_${index}` : null,
    status,
    requestedAt,
    processedAt,
    failedAt,
    failureReason,
  };
}

export function createDownloadLogs(
  userId: string,
  fileId: string,
  packId: string,
  scenario: 'normal' | 'limit' | 'at_limit'
): DownloadLogSeedData[] {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const logs: DownloadLogSeedData[] = [];

  if (scenario === 'normal') {
    logs.push({
      userId,
      fileId,
      packId,
      dateKey: today,
      count: 3 + Math.floor(Math.random() * 4),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
    });
  } else if (scenario === 'at_limit') {
    logs.push({
      userId,
      fileId,
      packId,
      dateKey: today,
      count: 10,
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
    });
  } else if (scenario === 'limit') {
    logs.push({
      userId,
      fileId,
      packId,
      dateKey: today,
      count: 9,
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
    });
    logs.push({
      userId,
      fileId,
      packId,
      dateKey: yesterday,
      count: 10,
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
    });
  }

  return logs;
}
