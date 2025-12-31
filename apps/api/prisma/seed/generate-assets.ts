import { createCanvas, type CanvasRenderingContext2D } from 'canvas';
import * as fs from 'node:fs';
import * as path from 'node:path';
import sharp from 'sharp';

const ASSETS_DIR = path.join(__dirname, '..', 'seed-assets');
const PREVIEWS_DIR = path.join(ASSETS_DIR, 'previews');
const AVATARS_DIR = path.join(ASSETS_DIR, 'avatars');
const COVERS_DIR = path.join(ASSETS_DIR, 'covers');

// Neon Lime Design System Colors
const COLORS = {
  lime: '#CDFF00',
  darkSurface: '#1A1F2E',
  pageBg: '#E8EEF2',
  surface: '#FFFFFF',
  textPrimary: '#12171E',
  textSecondary: '#5E7086',
  pink: '#FF69B4',
  purple: '#9B59B6',
  red: '#E74C3C',
  orange: '#F39C12',
  cyan: '#00D9FF',
  magenta: '#FF00FF',
};

// Adult content themed color palettes
const SENSUAL_PALETTES = [
  { primary: '#FF1493', secondary: '#8B008B', accent: '#FF69B4' }, // Deep Pink
  { primary: '#DC143C', secondary: '#8B0000', accent: '#FF6347' }, // Crimson
  { primary: '#9B30FF', secondary: '#4B0082', accent: '#DA70D6' }, // Purple
  { primary: '#FF4500', secondary: '#8B2500', accent: '#FFA500' }, // Red-Orange
  { primary: '#FF0080', secondary: '#4A0040', accent: '#FF69B4' }, // Hot Pink
  { primary: '#E6005C', secondary: '#800033', accent: '#FF3366' }, // Rose
  { primary: '#CC00FF', secondary: '#660080', accent: '#E066FF' }, // Violet
  { primary: '#FF2200', secondary: '#990000', accent: '#FF6644' }, // Scarlet
  { primary: '#00FFD4', secondary: '#007766', accent: COLORS.lime }, // Neon Teal
  { primary: COLORS.lime, secondary: '#669900', accent: '#E6FF66' }, // Lime
];

function createGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  angle = 45
): CanvasGradient {
  const radians = (angle * Math.PI) / 180;
  const x1 = width / 2 - (Math.cos(radians) * width) / 2;
  const y1 = height / 2 - (Math.sin(radians) * height) / 2;
  const x2 = width / 2 + (Math.cos(radians) * width) / 2;
  const y2 = height / 2 + (Math.sin(radians) * height) / 2;

  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });
  return gradient;
}

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: 'feminine' | 'abstract' | 'lips' | 'heart'
): void {
  ctx.save();

  if (type === 'feminine') {
    // Stylized feminine silhouette
    ctx.beginPath();
    const centerX = width / 2;
    const startY = height * 0.15;

    // Head
    ctx.ellipse(centerX, startY + 25, 20, 25, 0, 0, Math.PI * 2);

    // Neck
    ctx.moveTo(centerX - 8, startY + 50);
    ctx.lineTo(centerX - 8, startY + 70);
    ctx.lineTo(centerX + 8, startY + 70);
    ctx.lineTo(centerX + 8, startY + 50);

    // Shoulders and body curves
    ctx.moveTo(centerX - 8, startY + 70);
    ctx.bezierCurveTo(
      centerX - 60,
      startY + 80,
      centerX - 50,
      startY + 150,
      centerX - 35,
      startY + 200
    );
    ctx.bezierCurveTo(
      centerX - 45,
      startY + 250,
      centerX - 50,
      startY + 300,
      centerX - 30,
      height * 0.85
    );

    ctx.lineTo(centerX + 30, height * 0.85);
    ctx.bezierCurveTo(
      centerX + 50,
      startY + 300,
      centerX + 45,
      startY + 250,
      centerX + 35,
      startY + 200
    );
    ctx.bezierCurveTo(
      centerX + 50,
      startY + 150,
      centerX + 60,
      startY + 80,
      centerX + 8,
      startY + 70
    );

    ctx.closePath();
  } else if (type === 'lips') {
    // Sensual lips
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.3;

    ctx.beginPath();
    // Upper lip
    ctx.moveTo(centerX - scale, centerY);
    ctx.bezierCurveTo(
      centerX - scale * 0.7,
      centerY - scale * 0.5,
      centerX - scale * 0.2,
      centerY - scale * 0.6,
      centerX,
      centerY - scale * 0.3
    );
    ctx.bezierCurveTo(
      centerX + scale * 0.2,
      centerY - scale * 0.6,
      centerX + scale * 0.7,
      centerY - scale * 0.5,
      centerX + scale,
      centerY
    );
    // Lower lip
    ctx.bezierCurveTo(
      centerX + scale * 0.6,
      centerY + scale * 0.7,
      centerX + scale * 0.2,
      centerY + scale * 0.8,
      centerX,
      centerY + scale * 0.6
    );
    ctx.bezierCurveTo(
      centerX - scale * 0.2,
      centerY + scale * 0.8,
      centerX - scale * 0.6,
      centerY + scale * 0.7,
      centerX - scale,
      centerY
    );
    ctx.closePath();
  } else if (type === 'heart') {
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const size = Math.min(width, height) * 0.35;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + size * 0.9);
    ctx.bezierCurveTo(
      centerX - size * 1.2,
      centerY + size * 0.3,
      centerX - size * 1.2,
      centerY - size * 0.5,
      centerX,
      centerY - size * 0.3
    );
    ctx.bezierCurveTo(
      centerX + size * 1.2,
      centerY - size * 0.5,
      centerX + size * 1.2,
      centerY + size * 0.3,
      centerX,
      centerY + size * 0.9
    );
    ctx.closePath();
  } else {
    // Abstract curves
    ctx.beginPath();
    const points = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius =
        Math.min(width, height) * 0.3 * (0.5 + Math.random() * 0.5);
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const cp1x =
          width / 2 + Math.cos(angle - 0.3) * radius * (1 + Math.random());
        const cp1y =
          height / 2 + Math.sin(angle - 0.3) * radius * (1 + Math.random());
        ctx.quadraticCurveTo(cp1x, cp1y, x, y);
      }
    }
    ctx.closePath();
  }

  ctx.restore();
}

function drawNeonGlow(
  ctx: CanvasRenderingContext2D,
  color: string,
  blur: number
): void {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function addNoiseOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity = 0.05
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 50 * opacity;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
}

// Generate preview images (pack covers)
async function generatePreviewImage(
  index: number,
  palette: (typeof SENSUAL_PALETTES)[0]
): Promise<Buffer> {
  const width = 800;
  const height = 1200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGradient = createGradient(
    ctx,
    width,
    height,
    [palette.secondary, palette.primary, palette.secondary],
    135 + index * 15
  );
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add some geometric shapes with glow
  const shapes = 3 + (index % 4);
  for (let i = 0; i < shapes; i++) {
    ctx.save();
    drawNeonGlow(ctx, palette.accent, 30 + i * 10);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 + i * 0.1;

    ctx.beginPath();
    if (i % 3 === 0) {
      // Circle
      ctx.arc(
        width * (0.2 + Math.random() * 0.6),
        height * (0.2 + Math.random() * 0.6),
        50 + Math.random() * 100,
        0,
        Math.PI * 2
      );
    } else if (i % 3 === 1) {
      // Rectangle
      ctx.rect(
        width * Math.random() * 0.5,
        height * Math.random() * 0.5,
        100 + Math.random() * 150,
        100 + Math.random() * 150
      );
    } else {
      // Triangle
      const cx = width * (0.3 + Math.random() * 0.4);
      const cy = height * (0.3 + Math.random() * 0.4);
      const size = 80 + Math.random() * 120;
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy + size);
      ctx.lineTo(cx - size, cy + size);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.restore();
  }

  // Draw main silhouette
  ctx.save();
  const silhouetteTypes: Array<'feminine' | 'lips' | 'heart' | 'abstract'> = [
    'feminine',
    'lips',
    'heart',
    'abstract',
  ];
  const silhouetteType = silhouetteTypes[index % silhouetteTypes.length];

  drawSilhouette(ctx, width, height, silhouetteType);
  drawNeonGlow(ctx, palette.accent, 40);
  ctx.fillStyle = createGradient(
    ctx,
    width,
    height,
    [palette.primary, palette.accent],
    90
  );
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.restore();

  // Add subtle noise
  addNoiseOverlay(ctx, width, height, 0.03);

  // Add title area at bottom
  ctx.save();
  const gradient = ctx.createLinearGradient(0, height * 0.75, 0, height);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height * 0.75, width, height * 0.25);
  ctx.restore();

  // Convert to buffer
  const buffer = canvas.toBuffer('image/png');
  return sharp(buffer).jpeg({ quality: 85 }).toBuffer();
}

// Generate avatar images
async function generateAvatarImage(index: number): Promise<Buffer> {
  const size = 400;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const palette = SENSUAL_PALETTES[index % SENSUAL_PALETTES.length];

  // Circular gradient background
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, palette.primary);
  gradient.addColorStop(0.7, palette.secondary);
  gradient.addColorStop(1, COLORS.darkSurface);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw stylized initial or icon
  ctx.save();
  drawNeonGlow(ctx, palette.accent, 20);
  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const initials = ['S', 'B', 'L', 'K', 'V', 'M', 'A', 'J', 'N', 'R'];
  ctx.fillText(initials[index % initials.length], size / 2, size / 2);
  ctx.restore();

  // Add ring effect
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  addNoiseOverlay(ctx, size, size, 0.02);

  const buffer = canvas.toBuffer('image/png');
  return sharp(buffer).jpeg({ quality: 90 }).toBuffer();
}

// Generate cover/banner images for creator profiles
async function generateCoverImage(index: number): Promise<Buffer> {
  const width = 1200;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const palette = SENSUAL_PALETTES[index % SENSUAL_PALETTES.length];

  // Create dynamic gradient
  const angle = 45 + index * 20;
  const bgGradient = createGradient(
    ctx,
    width,
    height,
    [COLORS.darkSurface, palette.secondary, palette.primary],
    angle
  );
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add flowing curves
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height * (0.3 + i * 0.15));

    for (let x = 0; x <= width; x += 50) {
      const y =
        height * (0.3 + i * 0.15) +
        Math.sin((x + index * 100) / 100 + i) * 30 +
        Math.sin((x + index * 50) / 50) * 20;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.2 + i * 0.05;
    drawNeonGlow(ctx, palette.accent, 15);
    ctx.stroke();
    ctx.restore();
  }

  // Add decorative elements
  ctx.save();
  ctx.globalAlpha = 0.4;
  drawNeonGlow(ctx, palette.accent, 30);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;

  // Draw some circles
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      width * (0.2 + i * 0.3),
      height / 2,
      40 + i * 20,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  ctx.restore();

  addNoiseOverlay(ctx, width, height, 0.02);

  const buffer = canvas.toBuffer('image/png');
  return sharp(buffer).jpeg({ quality: 85 }).toBuffer();
}

export async function generateAllAssets(): Promise<void> {
  console.log('Generating seed assets...\n');

  // Ensure directories exist
  [ASSETS_DIR, PREVIEWS_DIR, AVATARS_DIR, COVERS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate 40 preview images (4 per pack for 10 packs)
  console.log('Generating preview images...');
  for (let i = 0; i < 40; i++) {
    const palette = SENSUAL_PALETTES[i % SENSUAL_PALETTES.length];
    const buffer = await generatePreviewImage(i, palette);
    const filename = `preview_${String(i + 1).padStart(2, '0')}.jpg`;
    fs.writeFileSync(path.join(PREVIEWS_DIR, filename), buffer);
    process.stdout.write(`  ${filename}\r`);
  }
  console.log('\n  Done! Created 40 preview images');

  // Generate 20 avatar images
  console.log('\nGenerating avatar images...');
  for (let i = 0; i < 20; i++) {
    const buffer = await generateAvatarImage(i);
    const filename = `avatar_${String(i + 1).padStart(2, '0')}.jpg`;
    fs.writeFileSync(path.join(AVATARS_DIR, filename), buffer);
    process.stdout.write(`  ${filename}\r`);
  }
  console.log('\n  Done! Created 20 avatar images');

  // Generate 15 cover images
  console.log('\nGenerating cover/banner images...');
  for (let i = 0; i < 15; i++) {
    const buffer = await generateCoverImage(i);
    const filename = `cover_${String(i + 1).padStart(2, '0')}.jpg`;
    fs.writeFileSync(path.join(COVERS_DIR, filename), buffer);
    process.stdout.write(`  ${filename}\r`);
  }
  console.log('\n  Done! Created 15 cover images');

  console.log('\nAll assets generated successfully!');
  console.log(`Assets location: ${ASSETS_DIR}`);
}

// Run if called directly
if (require.main === module) {
  generateAllAssets().catch(console.error);
}
