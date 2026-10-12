import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import bcrypt from 'bcryptjs';
import { connectDB } from './src/lib/db';
import Category from './src/models/Category';
import News from './src/models/News';
import User from './src/models/User';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper to generate slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Download image locally to public/uploads
async function downloadImage(url: string, filenamePrefix: string): Promise<string> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return '/placeholder.jpg';
  }

  const extMatch = url.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i);
  const ext = extMatch ? extMatch[1] : 'png';
  const fileName = `${filenamePrefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(`/uploads/${fileName}`);
        });
      } else {
        // Fallback placeholder if 404 or blocked
        resolve('/placeholder.jpg');
      }
    });

    req.on('error', () => {
      resolve('/placeholder.jpg');
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve('/placeholder.jpg');
    });
  });
}

async function seed() {
  console.log('🌱 Starting Seed process...');
  await connectDB();

  // 1. Create Default Admin User
  const adminEmail = 'admin@metrotimes.com';
  const existingUser = await User.findOne({ email: adminEmail });
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Metrotimes Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@metrotimes.com / admin123');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // Read JSON file
  const jsonPath = path.join(process.cwd(), '..', 'abpnews-website', 'src', 'data', 'newsData.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ newsData.json not found at:', jsonPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(rawData);

  // Clear existing categories and news if needed or sync
  console.log('🧹 Clearing previous DB entries for fresh seed...');
  await Category.deleteMany({});
  await News.deleteMany({});

  // 2. Map and Seed Categories & Subcategories
  const categoryMap = new Map<string, any>(); // Name -> Doc

  // Extract from data.categories
  if (data.categories && Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      if (!cat.name) continue;
      let slug = cat.slug ? cat.slug.replace(/^\/category\//, '').replace(/^\//, '') : slugify(cat.name);
      if (!slug) slug = slugify(cat.name);
      
      const categoryDoc = await Category.create({
        name: cat.name,
        slug: slug,
        description: `${cat.name} category news and updates`,
        parentId: null,
        isActive: true,
      });
      categoryMap.set(cat.name.toUpperCase(), categoryDoc);
    }
  }

  // Standard category list fallback if some missing
  const defaultCats = ['INDIA', 'WORLD', 'SPORTS', 'BUSINESS', 'ENTERTAINMENT', 'LIFESTYLE', 'TECHNOLOGY', 'ELECTIONS', 'UTILITY'];
  for (const catName of defaultCats) {
    if (!categoryMap.has(catName)) {
      const slug = slugify(catName);
      const catDoc = await Category.create({
        name: catName,
        slug,
        description: `${catName} section`,
        parentId: null,
        isActive: true,
      });
      categoryMap.set(catName, catDoc);
    }
  }

  // Create subcategories for rich demo
  const subCategoriesData: Record<string, string[]> = {
    INDIA: ['Politics', 'National News', 'State News'],
    SPORTS: ['Cricket', 'Football', 'Tennis'],
    BUSINESS: ['Markets', 'Economy', 'Personal Finance'],
    ENTERTAINMENT: ['Bollywood', 'Hollywood', 'OTT'],
    TECHNOLOGY: ['Gadgets', 'AI & Future', 'Cybersecurity'],
  };

  const subCategoryMap = new Map<string, any>(); // "CATNAME:SUBCATNAME" -> Doc

  for (const [parentName, subList] of Object.entries(subCategoriesData)) {
    const parentDoc = categoryMap.get(parentName.toUpperCase());
    if (parentDoc) {
      for (const subName of subList) {
        const subSlug = slugify(`${parentDoc.slug}-${subName}`);
        const subDoc = await Category.create({
          name: subName,
          slug: subSlug,
          description: `${subName} sub-category under ${parentName}`,
          parentId: parentDoc._id,
          isActive: true,
        });
        subCategoryMap.set(`${parentName.toUpperCase()}:${subName.toUpperCase()}`, subDoc);
      }
    }
  }

  console.log(`✅ Seeded ${categoryMap.size} Main Categories and Subcategories.`);

  // 3. Extract News items from JSON
  const articlesList: any[] = [];

  if (data.leadStory) {
    articlesList.push({ ...data.leadStory, isFeatured: true });
  }

  const arraysToExtract = [
    'trendingNews',
    'sportsNews',
    'entertainmentNews',
    'techNews',
    'lifestyleNews',
    'businessNews',
    'worldNews',
    'electionsNews',
    'stateNews'
  ];

  for (const key of arraysToExtract) {
    if (data[key] && Array.isArray(data[key])) {
      articlesList.push(...data[key]);
    }
  }

  console.log(`⏳ Downloading images and seeding ${articlesList.length} articles...`);

  let count = 0;
  const processedSlugs = new Set<string>();

  for (const art of articlesList) {
    if (!art.title) continue;

    let articleSlug = art.slug ? slugify(art.slug) : slugify(art.title);
    if (processedSlugs.has(articleSlug)) {
      articleSlug = `${articleSlug}-${count}`;
    }
    processedSlugs.add(articleSlug);

    // Identify Category
    let catName = (art.category || 'INDIA').toUpperCase();
    let categoryDoc = categoryMap.get(catName);
    if (!categoryDoc) {
      // create dynamically if unknown
      categoryDoc = await Category.create({
        name: art.category || 'General',
        slug: slugify(art.category || 'General'),
        parentId: null,
        isActive: true,
      });
      categoryMap.set(catName, categoryDoc);
    }

    // Download image locally
    let localImagePath = '/placeholder.jpg';
    if (art.image) {
      localImagePath = await downloadImage(art.image, `news_${count}`);
    }

    // Prepare content
    const contentArr = Array.isArray(art.content)
      ? art.content
      : [art.summary || art.title];

    await News.create({
      title: art.title,
      slug: articleSlug,
      originalId: art.id || `art-${count}`,
      summary: art.summary || art.title,
      content: contentArr,
      image: localImagePath,
      originalImageLink: art.image || '',
      categoryId: categoryDoc._id,
      subCategoryId: null,
      author: art.author || 'Metrotimes Live Web Desk',
      readTime: art.readTime || '3 min read',
      publishedDate: art.date || new Date().toISOString().split('T')[0],
      timeAgo: art.time || 'Just now',
      isFeatured: !!art.isFeatured,
      isTrending: keyMatchesTrending(art),
      status: 'published',
      views: Math.floor(Math.random() * 5000) + 100,
    });

    count++;
    if (count % 10 === 0) {
      console.log(`   ...processed ${count} news articles`);
    }
  }

  console.log(`🎉 Seed Completed Successfully! Total Articles Seeded: ${count}`);
  process.exit(0);
}

function keyMatchesTrending(art: any): boolean {
  return !!art.isTrending;
}

seed().catch((err) => {
  console.error('❌ Seed Script Error:', err);
  process.exit(1);
});
