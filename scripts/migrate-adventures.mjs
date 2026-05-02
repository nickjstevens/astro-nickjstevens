import fs from 'node:fs/promises';
import { existsSync, createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const notesRoot = '/home/nick/Documents/notes-vault/Notion/Our Family Adventures';
const attachmentsRoot = '/home/nick/Documents/notes-vault/Attachments';
const contentRoot = path.join(repo, 'src/content/adventures');
const publicRoot = path.join(repo, 'public/adventures/assets');
const tmpRoot = path.join(repo, '.tmp/notion-adventure-assets');

const notionHeaders = {
  'User-Agent': 'Mozilla/5.0',
  'Content-Type': 'application/json',
  'Notion-Client-Version': '23.13.20260502.1407',
};
const notionSpaceId = '8f75411c-3b0b-43b2-bcc0-e49c9db63fe9';

const trips = [
  {
    slug: '2024-usa',
    title: '2024 USA',
    subtitle: 'A summer road trip across the American West.',
    source: 'local',
    overview: path.join(notesRoot, '2024 USA/2024 USA.md'),
    daysDir: path.join(notesRoot, '2024 USA/USA 2024 Itinerary'),
    year: 2024,
    icon: '🇺🇸',
  },
  {
    slug: '2025-switzerland',
    title: '2025 Switzerland',
    subtitle: 'A family Alpine road trip through France and Switzerland.',
    source: 'local',
    overview: path.join(notesRoot, '2025 Switzerland/2025 Switzerland.md'),
    daysDir: path.join(notesRoot, '2025 Switzerland/Switzerland 2025'),
    year: 2025,
    icon: '🇨🇭',
  },
  {
    slug: '2025-usa',
    title: '2025 USA',
    subtitle: 'A winter family adventure in New England and New York.',
    source: 'notion',
    year: 2025,
    icon: '⛷️',
    overviewPageId: '2baed181-42a5-806c-9da2-f674a0fda72d',
    dayPages: [
      ['Day 1 - Devon UK to London UK','2baed181-42a5-81e9-8c70-c15144bf5e44'],
      ['Day 2 - London UK to North Conway NH','2cced181-42a5-809d-97e4-fa9a43757110'],
      ['Day 3 - North Conway and Nestlenook Farm','2cced181-42a5-8084-8cae-f48685816142'],
      ['Day 4 - Sledge and Chill','2cded181-42a5-80ea-be44-de5e85476a35'],
      ['Day 5 - Skiing at Cranmore','2ceed181-42a5-80ca-8b96-c80ec03248e0'],
      ['Day 6 - Mountain Coaster and Cookies with Santa','2ceed181-42a5-806d-adba-c1bad665373c'],
      ['Day 7 - Driving to Manchester, VT','2d1ed181-42a5-8063-a145-f2674d17002c'],
      ['Day 8 - Driving to Montville, NY','2d2ed181-42a5-80ac-8dfb-d10d57974a1b'],
      ['Day 9 - New York, New York','2d3ed181-42a5-8054-b62e-c6653b221343'],
      ['Day 10 - Christmas Eve','2d4ed181-42a5-8024-84a9-e61328cf1a99'],
      ['Day 11 - Christmas Day','2d6ed181-42a5-804e-9aa3-ccd2e73fa322'],
      ['Day 12 - Boxing Day','2d6ed181-42a5-8015-b1ff-ea5bbcf0b51b'],
      ['Day 13 - Ski Quechee','2d6ed181-42a5-8098-805e-c2029296d8fd'],
      ['Day 14 - Woodstock','2d7ed181-42a5-80b9-b23d-e1e9d74a1d4a'],
      ['Day 15 - Ice Rain to New Jersey','2dbed181-42a5-80f6-84ff-f2bcb805514a'],
      ['Day 16 - Immigration and back to Vermont','2dbed181-42a5-8015-a6b3-d59c3fd00ccd'],
      ['Day 17 - Ben and Jerrys and Johnson','2dbed181-42a5-8017-bae1-e362f8a95c23'],
      ['Day 18 - Johnson Lazy Day','2dded181-42a5-80e7-82a0-d331ea71557a'],
      ['Day 19 - Stowe','2dded181-42a5-80f6-97f8-fe56ed2092d6'],
      ['Day 20 - Back to Boston','2dded181-42a5-80d1-9cca-e915052d9141'],
    ],
  },
];

const slugify = (value) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escapeYaml = (value) => JSON.stringify(String(value ?? ''));
const plainText = (notionRichText = []) => notionRichText.map((part) => part[0]).join('');

function splitFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return [{}, raw];
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return [{}, raw];
  const fm = raw.slice(4, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, '');
  const data = {};
  let current = null;
  for (const line of fm.split('\n')) {
    if (/^\s+-\s+/.test(line) && current) {
      data[current] = [...(Array.isArray(data[current]) ? data[current] : []), line.replace(/^\s+-\s+/, '').replace(/^"|"$/g, '')];
      continue;
    }
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    current = match[1].trim();
    let value = match[2].trim();
    if (value === '') { data[current] = ''; continue; }
    value = value.replace(/^"|"$/g, '');
    data[current] = value;
  }
  return [data, body];
}

async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(dir, entry.name));
}

async function ensureCleanGeneratedDirs() {
  await fs.rm(contentRoot, { recursive: true, force: true });
  await fs.rm(tmpRoot, { recursive: true, force: true });
  await fs.mkdir(contentRoot, { recursive: true });
  await fs.mkdir(publicRoot, { recursive: true });
  await fs.mkdir(tmpRoot, { recursive: true });
}

async function optimiseImage(source, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  if (existsSync(dest)) return;
  await sharp(source, { failOn: 'none' })
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest);
}

async function publicImageForLocal(ref, tripSlug, pageSlug, counters) {
  const cleanRef = ref.replace(/^Attachments\//, '').split('|')[0].trim();
  const source = path.join(attachmentsRoot, cleanRef);
  if (!existsSync(source)) throw new Error(`Missing attachment ${cleanRef}`);
  counters[pageSlug] = (counters[pageSlug] ?? 0) + 1;
  const destName = `${pageSlug}-${String(counters[pageSlug]).padStart(2, '0')}.webp`;
  const dest = path.join(publicRoot, tripSlug, destName);
  try {
    await optimiseImage(source, dest);
  } catch (error) {
    console.warn(`Skipping unsupported image ${source}: ${error.message}`);
    return null;
  }
  return `/adventures/assets/${tripSlug}/${destName}`;
}

async function publicVideoForLocal(ref, tripSlug, pageSlug, counters) {
  const cleanRef = ref.replace(/^Attachments\//, '').split('|')[0].trim();
  const source = path.join(attachmentsRoot, cleanRef);
  if (!existsSync(source)) throw new Error(`Missing video attachment ${cleanRef}`);
  counters[pageSlug] = (counters[pageSlug] ?? 0) + 1;
  const ext = path.extname(cleanRef).toLowerCase() || '.mov';
  const destName = `${pageSlug}-${String(counters[pageSlug]).padStart(2, '0')}${ext}`;
  const dest = path.join(publicRoot, tripSlug, destName);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  if (!existsSync(dest)) await fs.copyFile(source, dest);
  return `/adventures/assets/${tripSlug}/${destName}`;
}

function coverRefFromFrontmatter(value) {
  if (!value) return null;
  const match = String(value).match(/\[\[(?:Attachments\/)?([^\]]+)\]\]/);
  return match?.[1] ?? null;
}

async function convertLocalBody(body, tripSlug, pageSlug, counters) {
  let out = body.replace(/<u>(.*?)<\/u>/g, '$1');
  const matches = [...out.matchAll(/!{1,2}\[([^\]]*)\]!\[\[([^\]]+)\]\]|!{1,2}\[([^\]]*)\]\[\[([^\]]+)\]\]|!{1,2}\[\[([^\]]+)\]\]/g)];
  for (const match of matches) {
    const caption = (match[1] || match[3] || '').trim();
    const ref = match[2] || match[4] || match[5];
    if (ref.endsWith('.base')) {
      out = out.replace(match[0], '');
      continue;
    }
    if (/\.(mov|mp4|m4v|webm)$/i.test(ref.split('|')[0])) {
      const publicPath = await publicVideoForLocal(ref, tripSlug, pageSlug, counters);
      const label = caption || path.basename(ref.split('|')[0]);
      out = out.replace(match[0], `<video controls playsinline preload="metadata" aria-label="${label.replace(/"/g, '&quot;')}" src="${publicPath}"></video>`);
      continue;
    }
    const publicPath = await publicImageForLocal(ref, tripSlug, pageSlug, counters);
    out = out.replace(match[0], publicPath ? `![${caption.replace(/]/g, '')}](${publicPath})` : '');
  }
  out = out.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
  out = out.replace(/\[\[([^\]]+)\]\]/g, '$1');
  return out.trim() + '\n';
}

function dayOrder(title, fallback) {
  const match = title.match(/Day\s+(\d+)/i);
  return match ? Number(match[1]) : fallback;
}

function yamlFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${escapeYaml(item)}`);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${escapeYaml(value)}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

function cleanMarkdown(text) {
  return text
    .replace(/[ \t]+$/gm, '')
    .trimEnd() + '\n';
}

async function writeEntry(trip, entry) {
  const dir = path.join(contentRoot, trip.slug);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${entry.slug}.md`);
  await fs.writeFile(file, cleanMarkdown(yamlFrontmatter(entry.frontmatter) + entry.body), 'utf8');
}

async function migrateLocalTrip(trip) {
  const imageCounters = {};
  const overviewRaw = await fs.readFile(trip.overview, 'utf8');
  const [overviewFm, overviewBodyRaw] = splitFrontmatter(overviewRaw);
  let heroImage = null;
  const overviewCover = coverRefFromFrontmatter(overviewFm.cover);
  if (overviewCover) heroImage = await publicImageForLocal(overviewCover, trip.slug, 'index', imageCounters);
  const overviewBody = await convertLocalBody(overviewBodyRaw, trip.slug, 'index', imageCounters);
  await writeEntry(trip, {
    slug: 'index',
    frontmatter: {
      title: trip.title,
      description: trip.subtitle,
      tripTitle: trip.title,
      tripSlug: trip.slug,
      kind: 'trip',
      year: trip.year,
      order: 0,
      icon: trip.icon,
      heroImage,
    },
    body: overviewBody || `${trip.subtitle}\n`,
  });

  const files = await listMarkdownFiles(trip.daysDir);
  const dayEntries = [];
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const [fm, bodyRaw] = splitFrontmatter(raw);
    const title = path.basename(file, '.md');
    if (!fm.Date || /untitled|new page/i.test(title)) continue;
    const order = dayOrder(title, dayEntries.length + 1);
    const slug = `day-${String(order).padStart(2, '0')}-${slugify(title.replace(/^Day\s+\d+\s*-\s*/i, ''))}`;
    let pageHero = null;
    const coverRef = coverRefFromFrontmatter(fm.cover);
    if (coverRef) pageHero = await publicImageForLocal(coverRef, trip.slug, slug, imageCounters);
    const body = await convertLocalBody(bodyRaw, trip.slug, slug, imageCounters);
    const description = [fm['Activities AM'], fm['Activities PM'], fm['Activities Evening']].filter(Boolean).join(' · ') || `${trip.title} day ${order}`;
    dayEntries.push({
      slug,
      frontmatter: {
        title,
        description,
        tripTitle: trip.title,
        tripSlug: trip.slug,
        kind: 'day',
        year: trip.year,
        order,
        date: fm.Date,
        sleepLocation: fm['Sleep Location'],
        activitiesAm: fm['Activities AM'],
        activitiesPm: fm['Activities PM'],
        activitiesEvening: fm['Activities Evening'],
        drivingTime: fm['Driving Time'],
        accommodation: fm.Accomodation || fm.Accommodation,
        heroImage: pageHero,
      },
      body,
    });
  }
  dayEntries.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  for (const entry of dayEntries) await writeEntry(trip, entry);
  return { trip: trip.slug, days: dayEntries.length, source: 'local' };
}

async function notionPost(endpoint, body) {
  const response = await fetch(`https://www.notion.so/api/v3/${endpoint}`, {
    method: 'POST',
    headers: notionHeaders,
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${endpoint} failed ${response.status}: ${await response.text()}`);
  return response.json();
}

async function loadNotionPage(pageId) {
  const data = await notionPost('loadCachedPageChunk', {
    pageId,
    limit: 100,
    cursor: { stack: [] },
    chunkNumber: 0,
    verticalColumns: false,
  });
  const blocks = Object.fromEntries(Object.entries(data.recordMap.block || {}).map(([id, wrapper]) => [id, wrapper.value.value]));
  return { root: blocks[pageId], blocks };
}

async function signedNotionUrl(blockId, url) {
  if (!url.startsWith('attachment:')) return url;
  const data = await notionPost('getSignedFileUrls', {
    urls: [{ permissionRecord: { table: 'block', id: blockId }, url }],
  });
  return data.signedUrls?.[0];
}

async function downloadToFile(url, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`download failed ${response.status} ${url}`);
  await pipeline(response.body, createWriteStream(dest));
}

async function publicImageForNotion(blockId, source, tripSlug, pageSlug, counters) {
  counters[pageSlug] = (counters[pageSlug] ?? 0) + 1;
  const destName = `${pageSlug}-${String(counters[pageSlug]).padStart(2, '0')}.webp`;
  const dest = path.join(publicRoot, tripSlug, destName);
  if (!existsSync(dest)) {
    try {
      const signed = await signedNotionUrl(blockId, source);
      const tmp = path.join(tmpRoot, `${blockId}-${path.basename(source).replace(/[^a-zA-Z0-9_.-]/g, '-') || 'image'}`);
      await downloadToFile(signed, tmp);
      await optimiseImage(tmp, dest);
    } catch (error) {
      console.warn(`Skipping Notion image ${blockId}: ${error.message}`);
      return null;
    }
  }
  return `/adventures/assets/${tripSlug}/${destName}`;
}

function notionPropText(props, key) {
  return plainText(props?.[key] || []);
}

function notionDate(props, key) {
  const chunks = props?.[key] || [];
  for (const chunk of chunks) {
    for (const attr of chunk[1] || []) {
      if (attr[0] === 'd') return attr[1]?.start_date;
    }
  }
  return '';
}

async function notionBlockMarkdown(block, blocks, tripSlug, pageSlug, counters) {
  const text = plainText(block.properties?.title || []);
  if (block.type === 'header') return `## ${text}\n\n`;
  if (block.type === 'sub_header') return `### ${text}\n\n`;
  if (block.type === 'sub_sub_header') return `#### ${text}\n\n`;
  if (block.type === 'bulleted_list') return `- ${text}\n`;
  if (block.type === 'numbered_list') return `1. ${text}\n`;
  if (block.type === 'quote') return `> ${text}\n\n`;
  if (block.type === 'text') return text ? `${text}\n\n` : '';
  if (block.type === 'image') {
    const source = block.format?.display_source || block.properties?.source?.[0]?.[0];
    if (!source) return '';
    const caption = notionPropText(block.properties, 'caption') || notionPropText(block.properties, 'title') || '';
    const publicPath = await publicImageForNotion(block.id, source, tripSlug, pageSlug, counters);
    return publicPath ? `![${caption.replace(/]/g, '')}](${publicPath})\n\n` : '';
  }
  let nested = '';
  for (const childId of block.content || []) nested += await notionBlockMarkdown(blocks[childId], blocks, tripSlug, pageSlug, counters);
  return nested;
}

async function migrateNotionTrip(trip) {
  const imageCounters = {};
  let overviewBody = trip.subtitle + '\n';
  let heroImage = null;
  try {
    const { root, blocks } = await loadNotionPage(trip.overviewPageId);
    if (root.format?.page_cover?.startsWith('http')) heroImage = root.format.page_cover;
    overviewBody = '';
    for (const childId of root.content || []) overviewBody += await notionBlockMarkdown(blocks[childId], blocks, trip.slug, 'index', imageCounters);
    overviewBody ||= trip.subtitle + '\n';
  } catch (error) {
    overviewBody = `${trip.subtitle}\n\n> Notion overview import failed: ${error.message}\n`;
  }
  await writeEntry(trip, {
    slug: 'index',
    frontmatter: { title: trip.title, description: trip.subtitle, tripTitle: trip.title, tripSlug: trip.slug, kind: 'trip', year: trip.year, order: 0, icon: trip.icon, heroImage },
    body: overviewBody,
  });

  let count = 0;
  for (const [fallbackTitle, pageId] of trip.dayPages) {
    const { root, blocks } = await loadNotionPage(pageId);
    const props = root.properties || {};
    const title = notionPropText(props, 'title') || fallbackTitle;
    const order = dayOrder(title, count + 1);
    const slug = `day-${String(order).padStart(2, '0')}-${slugify(title.replace(/^Day\s+\d+\s*-\s*/i, ''))}`;
    let heroImage = null;
    let body = '';
    for (const childId of root.content || []) {
      const before = imageCounters[slug] || 0;
      body += await notionBlockMarkdown(blocks[childId], blocks, trip.slug, slug, imageCounters);
      if (!heroImage && (imageCounters[slug] || 0) > before) heroImage = `/adventures/assets/${trip.slug}/${slug}-${String(imageCounters[slug]).padStart(2, '0')}.webp`;
    }
    body ||= `${trip.title} day ${order}.\n`;
    await writeEntry(trip, {
      slug,
      frontmatter: {
        title,
        description: `${trip.title} day ${order}`,
        tripTitle: trip.title,
        tripSlug: trip.slug,
        kind: 'day',
        year: trip.year,
        order,
        date: notionDate(props, 'JL>H'),
        sleepLocation: notionPropText(props, 'WJP^'),
        activitiesAm: notionPropText(props, 'Bxo^'),
        activitiesPm: notionPropText(props, '=VOC'),
        activitiesEvening: notionPropText(props, 'YK\\@'),
        drivingTime: notionPropText(props, '=\\BF'),
        accommodation: notionPropText(props, 'en?i') || notionPropText(props, '^MAN'),
        heroImage,
        sourceUrl: `https://nickjstevens.notion.site/${slugify(title)}-${pageId.replaceAll('-', '')}?pvs=25`,
      },
      body,
    });
    count++;
  }
  return { trip: trip.slug, days: count, source: 'notion' };
}

async function main() {
  await ensureCleanGeneratedDirs();
  const results = [];
  for (const trip of trips) {
    results.push(trip.source === 'local' ? await migrateLocalTrip(trip) : await migrateNotionTrip(trip));
  }
  await fs.rm(tmpRoot, { recursive: true, force: true });
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
