// Sinh ảnh SVG minh họa cho HW1: node scripts/generate-photos.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { PHOTOS } from "../src/gallery/photos.js";

const W = 800, H = 600;
const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;

const scenes = {
  nature: (h, i) => `
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="${200 + i * 120}" cy="180" r="70" fill="${hsl(h + 20, 95, 70)}"/>
    <path d="M0 600 L180 ${260 + i * 10} L360 600Z" fill="${hsl(h + 140, 35, 35)}"/>
    <path d="M220 600 L460 ${220 + i * 15} L700 600Z" fill="${hsl(h + 150, 30, 28)}"/>
    <path d="M480 600 L680 ${300 - i * 10} L800 420 L800 600Z" fill="${hsl(h + 130, 32, 40)}"/>
    <rect y="500" width="${W}" height="100" fill="${hsl(h + 120, 40, 30)}" opacity=".85"/>`,
  city: (h, i) => {
    let b = "";
    for (let k = 0; k < 9; k++) {
      const x = k * 90 + 5, bh = 180 + ((k * 73 + i * 41) % 240);
      b += `<rect x="${x}" y="${H - bh}" width="80" height="${bh}" fill="${hsl(h, 25, 18 + (k % 3) * 6)}"/>`;
      for (let r = 0; r < Math.floor(bh / 40) - 1; r++)
        b += `<rect x="${x + 14}" y="${H - bh + 20 + r * 40}" width="16" height="18" fill="${(k + r + i) % 3 ? hsl(48, 95, 70) : hsl(h, 20, 30)}"/><rect x="${x + 48}" y="${H - bh + 20 + r * 40}" width="16" height="18" fill="${(k * r + i) % 4 ? hsl(48, 95, 65) : hsl(h, 20, 30)}"/>`;
    }
    return `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="660" cy="110" r="45" fill="${hsl(55, 90, 88)}"/>${b}`;
  },
  evidence: (h, i) => {
    let lines = "";
    for (let k = 0; k < 9; k++) lines += `<rect x="190" y="${150 + k * 38}" width="${380 - ((k * 37 + i * 13) % 160)}" height="12" rx="6" fill="${hsl(h, 20, k % 4 === 0 ? 45 : 70)}"/>`;
    return `<rect width="${W}" height="${H}" fill="${hsl(h, 30, 88)}"/>
      <rect x="150" y="70" width="500" height="470" rx="16" fill="#fff" stroke="${hsl(h, 25, 60)}" stroke-width="4"/>
      <rect x="190" y="100" width="260" height="22" rx="8" fill="${hsl(h, 45, 35)}"/>${lines}
      <circle cx="560" cy="460" r="52" fill="none" stroke="${hsl(355, 75, 45)}" stroke-width="8" transform="rotate(-15 560 460)"/>
      <text x="560" y="468" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="${hsl(355, 75, 45)}" transform="rotate(-15 560 460)">#0${i + 1}</text>`;
  },
};

mkdirSync(new URL("../public/photos/", import.meta.url), { recursive: true });
const counters = {};
for (const p of PHOTOS) {
  const i = (counters[p.category] = (counters[p.category] ?? -1) + 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${p.alt}">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hsl(p.hue, 70, 55)}"/><stop offset="1" stop-color="${hsl(p.hue + 30, 80, 82)}"/></linearGradient></defs>
${scenes[p.category](p.hue, i)}
</svg>`;
  writeFileSync(new URL(`../public/photos/${p.id}.svg`, import.meta.url), svg.replace(/\n\s+/g, "\n"));
}
console.log(`Đã tạo ${PHOTOS.length} ảnh SVG trong public/photos/`);
