import { MongoClient } from 'mongodb';

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://parthchampanerirndtechnosoft_db_user:qwaszx123@cluster0.fn1bc3b.mongodb.net/abpnews_admin?retryWrites=true&w=majority';

async function updateExistingNewsSeo() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  const col = db.collection('news');
  const allArticles = await col.find({}).toArray();

  console.log(`Found ${allArticles.length} existing news articles. Updating SEO fields...`);

  let updatedCount = 0;
  for (const doc of allArticles) {
    const slug = doc.slug || `article-${doc._id}`;
    const title = (doc.title || 'Metrotimes News').trim();
    const summary = (doc.summary || title).trim();
    const image = doc.image || 'https://metrotimes.com/logo1.png';

    const words = title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w: string) => w.length > 3)
      .slice(0, 6);
    const keywords = ['Metrotimes', 'News', 'Breaking News', ...words].join(', ');

    const metaTitle = doc.metaTitle && doc.metaTitle.trim() ? doc.metaTitle : `${title} | Metrotimes`;
    const metaDescription = doc.metaDescription && doc.metaDescription.trim() ? doc.metaDescription : summary;
    const metaKeywords = doc.metaKeywords && doc.metaKeywords.trim() ? doc.metaKeywords : keywords;
    const canonicalUrl = doc.canonicalUrl && doc.canonicalUrl.trim() ? doc.canonicalUrl : `https://metrotimes.com/news/${slug}`;

    const schemaScript = doc.schemaScript && doc.schemaScript.trim()
      ? doc.schemaScript
      : `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": ${JSON.stringify(title)},
  "description": ${JSON.stringify(summary)},
  "image": [${JSON.stringify(image)}],
  "datePublished": ${JSON.stringify(doc.publishedDate || doc.createdAt || new Date().toISOString())},
  "author": {
    "@type": "Person",
    "name": ${JSON.stringify(doc.author || 'Metrotimes Editor')}
  },
  "publisher": {
    "@type": "Organization",
    "name": "Metrotimes",
    "logo": {
      "@type": "ImageObject",
      "url": "https://metrotimes.com/logo1.png"
    }
  }
}
</script>`;

    const ogTitle = doc.ogTitle && doc.ogTitle.trim() ? doc.ogTitle : metaTitle;
    const ogDescription = doc.ogDescription && doc.ogDescription.trim() ? doc.ogDescription : metaDescription;
    const ogImage = doc.ogImage && doc.ogImage.trim() ? doc.ogImage : image;

    await col.updateOne(
      { _id: doc._id },
      {
        $set: {
          metaTitle,
          metaDescription,
          metaKeywords,
          canonicalUrl,
          schemaScript,
          ogTitle,
          ogDescription,
          ogImage,
        },
      }
    );
    updatedCount++;
  }

  console.log(`✅ Successfully backfilled SEO metadata for all ${updatedCount} articles!`);
  await client.close();
}

updateExistingNewsSeo().catch((err) => {
  console.error('Update SEO script error:', err);
  process.exit(1);
});
