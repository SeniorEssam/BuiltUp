const fs = require('fs');

const SITE_URL = 'https://senioressam.github.io/BuiltUp';

const getSeoBlock = (title, desc, url, schemaType, imagePath) => `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${SITE_URL}/${imagePath}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="V Smart Solutions" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${SITE_URL}/${imagePath}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "${schemaType}",
      "name": "V Smart Solutions",
      "url": "${SITE_URL}",
      "logo": "${SITE_URL}/wp-content/uploads/2024/06/icon-165x47(white).svg",
      "description": "${desc}",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+201060388882",
        "contactType": "customer service"
      }
    }
    </script>
`;

function injectSEO(file, title, desc, url, schemaType, imagePath) {
    let html = fs.readFileSync(file, 'utf8');
    
    // Strip duplicate old metadata
    html = html.replace(/<meta\s+(property|name)=["'](og:[^"']+|twitter:[^"']+|description|keywords)["'][^>]*>/gi, '');
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');

    if (html.includes('<title>')) {
        html = html.replace(/<title>.*?<\/title>/s, getSeoBlock(title, desc, url, schemaType, imagePath));
    } else {
        html = html.replace('<head>', '<head>\n' + getSeoBlock(title, desc, url, schemaType, imagePath));
    }
    
    // Clean up empty lines created by regex deletions
    html = html.replace(/^\s*[\r\n]/gm, '');
    
    fs.writeFileSync(file, html);
}

injectSEO('index.html', 'Home | V Smart Solutions', 'Top-tier smart hotel solutions and construction equipment.', `${SITE_URL}/index.html`, 'LocalBusiness', 'assets/images/hero-bg.png');
injectSEO('index-ar.html', 'الرئيسية | V Smart Solutions', 'حلول الفنادق الذكية ومعدات البناء عالية الجودة.', `${SITE_URL}/index-ar.html`, 'LocalBusiness', 'assets/images/hero-bg.png');
injectSEO('products.html', 'Product Catalog | V Smart Solutions', 'Explore our wide range of V Smart Solutions products including CCTVs, Furniture, and smart lighting.', `${SITE_URL}/products.html`, 'CollectionPage', 'wp-content/uploads/2024/06/page-header-bg.jpg');
injectSEO('products-ar.html', 'كتالوج المنتجات | V Smart Solutions', 'تصفح تشكيلتنا الواسعة من منتجات V Smart Solutions بما في ذلك الكاميرات والأثاث والإضاءة الذكية.', `${SITE_URL}/products-ar.html`, 'CollectionPage', 'wp-content/uploads/2024/06/page-header-bg.jpg');

console.log("SEO injection successfully completed.");
