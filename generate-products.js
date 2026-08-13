const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURATION
// 'overwrite_all' : Deletes all old generated HTML pages and recreates them from scratch (Default).
// 'skip_existing' : Only creates completely new HTML files if they don't already exist. Preserves old files.
// ==========================================
const GENERATION_MODE = 'overwrite_all';

// 1. Load Products Data securely
const jsCode = fs.readFileSync(path.join(__dirname, 'wp-content/themes/builtup/assets/js/products.js'), 'utf8');
let vSmartProducts = [];
try {
    eval(jsCode.replace('const vSmartProducts = ', 'vSmartProducts = '));
} catch(e) {
    console.error("Failed to parse products.js", e);
    process.exit(1);
}

// 2. Load Base Templates
const baseEngTemplate = fs.readFileSync(path.join(__dirname, 'product-base.html'), 'utf8');
const baseArTemplate = fs.readFileSync(path.join(__dirname, 'product-base-ar.html'), 'utf8');

// 3. Clean up old generated product files to prevent dead files (Only if overwriting)
if (GENERATION_MODE === 'overwrite_all') {
    const allFiles = fs.readdirSync(__dirname);
    allFiles.forEach(file => {
        if (file.startsWith('product-') && file.endsWith('.html')) {
            const preserveFiles = ['product-01.html', 'product-01-ar.html', 'product-base.html', 'product-base-ar.html'];
            if (!preserveFiles.includes(file)) {
                fs.unlinkSync(path.join(__dirname, file));
                console.log(`Deleted old file: ${file}`);
            }
        }
    });
}

// 4. Generate Pages
const SITE_URL = 'https://senioressam.github.io/BuiltUp';
const PHONE_NUMBER = '+201060388882';

const getCleanImgUrl = (pathStr) => {
    // pathStr e.g. "../../BuiltUp/wp-content/..." -> "wp-content/..."
    return pathStr.replace('../../BuiltUp/', '');
};

vSmartProducts.forEach(product => {
    const slug = product.id.toLowerCase();
    const engFilePath = path.join(__dirname, `product-${slug}.html`);
    const arFilePath = path.join(__dirname, `product-${slug}-ar.html`);

    let skipEng = GENERATION_MODE === 'skip_existing' && fs.existsSync(engFilePath);
    let skipAr = GENERATION_MODE === 'skip_existing' && fs.existsSync(arFilePath);

    if (skipEng && skipAr) {
        console.log(`Skipping already existing product: ${slug}`);
        return; // move to next product
    }
    
    // Process Images
    const mainImg = product.images.length ? product.images[0] : "";
    const cleanMainImgUrl = mainImg ? getCleanImgUrl(mainImg) : "";
    
    const thumbnailsEngHtml = product.images.map((img, idx) => `
        <img src="${img}" class="gallery-thumb" data-full="${img}" style="width: 80px; height: 80px; object-fit: contain; cursor: pointer; border: 2px solid ${idx===0 ? 'var(--e-global-color-primary)' : 'transparent'}; border-radius: 8px; background: #f9f9f9; padding: 5px;">
    `).join('');
    
    const thumbnailsArHtml = product.images.map((img, idx) => `
        <img src="${img}" class="gallery-thumb" data-full="${img}" style="width: 80px; height: 80px; object-fit: contain; cursor: pointer; border: 2px solid ${idx===0 ? 'var(--e-global-color-primary)' : 'transparent'}; border-radius: 8px; background: #f9f9f9; padding: 5px;">
    `).join('');

    // Common Parts
    let starsEngHtml = '<div style="color:#FFB800; font-size:18px; margin-bottom:15px;">' + '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating)) + '</div>';
    let starsArHtml = '<div style="color:#FFB800; font-size:18px; margin-bottom:15px; direction: ltr; text-align: right;">' + '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating)) + '</div>';

    let videoEngHtml = product.videoCode ? `
        <div style="margin-top: 40px;">
            <h3 style="margin-bottom: 20px; color:var(--e-global-color-primary);">Product Video</h3>
            <iframe width="100%" height="450" src="https://www.youtube.com/embed/${product.videoCode}" frameborder="0" allowfullscreen style="border-radius:15px;"></iframe>
        </div>
    ` : '';
    
    let videoArHtml = product.videoCode ? `
        <div style="margin-top: 40px;">
            <h3 style="margin-bottom: 20px; color:var(--e-global-color-primary);">فيديو المنتج</h3>
            <iframe width="100%" height="450" src="https://www.youtube.com/embed/${product.videoCode}" frameborder="0" allowfullscreen style="border-radius:15px;"></iframe>
        </div>
    ` : '';

    // ==========================================
    // ENGLISH PAGE
    // ==========================================
    let urlEng = `${SITE_URL}/product-${slug}.html`;
    
    // SEO block Eng
    let seoEng = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <title>${product.titleEng} | ${product.categoryEng} | V Smart Solutions</title>
    <meta name="description" content="${product.shortDescEng}" />
    <link rel="canonical" href="${urlEng}" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${product.titleEng} | V Smart Solutions" />
    <meta property="og:description" content="${product.shortDescEng}" />
    <meta property="og:image" content="${SITE_URL}/${cleanMainImgUrl}" />
    <meta property="og:url" content="${urlEng}" />
    <meta property="og:site_name" content="V Smart Solutions" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${product.titleEng} | V Smart Solutions" />
    <meta name="twitter:description" content="${product.shortDescEng}" />
    <meta name="twitter:image" content="${SITE_URL}/${cleanMainImgUrl}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "${product.titleEng}",
      "image": ${JSON.stringify(product.images.map(img => SITE_URL + '/' + getCleanImgUrl(img)))},
      "description": "${product.shortDescEng}",
      "sku": "${product.id}",
      "brand": {
        "@type": "Brand",
        "name": "V Smart Solutions"
      },
      "offers": {
        "@type": "Offer",
        "url": "${urlEng}",
        "priceCurrency": "USD",
        "price": "${product.price}",
        "availability": "https://schema.org/InStock"
      }
    }
    </script>
    `;

    let badgeEngHtml = product.saleBadgeEng ? `<div style="display:inline-block; margin-bottom:15px; background:var(--e-global-color-accent); color:#fff; padding:6px 15px; border-radius:20px; font-weight:bold; font-size:14px;">${product.saleBadgeEng}</div>` : '';
    let oldPriceEngHtml = product.oldPrice ? `<span style="text-decoration:line-through; color:#999; font-size:18px; margin-left:15px;">$${product.oldPrice}</span>` : '';
    let specsEngHtml = product.specs.map(s => `
        <div style="display: flex; gap: 15px; align-items: start; border-bottom: 1px solid #eee; padding: 12px 0;">
            <div style="flex: 1; font-weight: bold; color: #555; min-width: 0; word-break: break-word;">${s.keyEng}</div>
            <div style="flex: 1.5; color: #777; min-width: 0; word-break: break-word;">${s.valEng}</div>
        </div>
    `).join('');

    let contentEng = `
    <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; width: 100%; padding: 50px 20px; box-sizing: border-box;">
    <!-- Top Split Section -->
    <div style="display: flex; flex-wrap: wrap; gap: 50px; margin-bottom: 60px;">
        <!-- Left: Gallery -->
        <div style="flex: 1; min-width: 300px; max-width: 600px;">
            <div style="background: #f9f9f9; padding: 30px; border-radius: 20px; border: 1px solid #eee; display: flex; justify-content: center; align-items: center; height: 450px; margin-bottom: 20px; position:relative;">
                <img id="main-product-img" src="${mainImg}" style="max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply;">
            </div>
            <div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;" id="thumbnail-container">
                ${thumbnailsEngHtml}
            </div>
        </div>

        <!-- Right: Details -->
        <div style="flex: 1; min-width: 300px;">
            <!-- Breadcrumbs -->
            <p style="color: #999; font-size: 13px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">
                <a href="../../BuiltUp/index.html" style="color:#999; text-decoration:none;">Home</a> / 
                <a href="../../BuiltUp/products.html" style="color:#999; text-decoration:none;">Products</a> / 
                <span style="color:var(--e-global-color-primary); font-weight:bold;">${product.categoryEng}</span>
            </p>
            
            ${badgeEngHtml}
            <h1 style="font-size: 36px; color: var(--e-global-color-primary); margin-bottom: 15px; line-height: 1.2;">${product.titleEng}</h1>
            <p style="color: #777; margin-bottom: 20px; font-size: 14px;">Product Code: <span style="font-weight:bold; color: #444;">${product.id}</span></p>
            ${starsEngHtml}
            <div style="display: flex; align-items: center; margin-bottom: 30px;">
                <span style="font-size: 36px; font-weight: bold; color: var(--e-global-color-accent);">$${product.price}</span>
                ${oldPriceEngHtml}
            </div>
            <p style="font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 40px;">${product.shortDescEng}</p>
            
            <a href="${product.pdfCatalogEng}" target="_blank" style="display: inline-flex; align-items: center; padding: 15px 35px; background: var(--e-global-color-primary); color: #fff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" onmouseover="this.style.background='var(--e-global-color-accent)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='var(--e-global-color-primary)'; this.style.transform='translateY(0)';">
                <i class="fas fa-file-pdf" style="margin-right: 12px; font-size: 20px;"></i> Download PDF Catalog
            </a>
        </div>
    </div>

    <!-- Middle Section: Description & Video -->
    <div style="border-top: 1px solid #eee; padding-top: 60px; margin-bottom: 60px;">
        <h3 style="font-size: 24px; color: var(--e-global-color-primary); margin-bottom: 25px;">Product Overview</h3>
        <p style="color: #555; line-height: 1.8; font-size: 16px;">${product.longDescEng}</p>
        ${videoEngHtml}
    </div>

    <!-- Specs Grid -->
    <div style="background: #fcfcfc; padding: 30px 20px; border-radius: 20px; border: 1px solid #eee; margin-bottom: 60px;">
        <h3 style="font-size: 24px; color: var(--e-global-color-primary); margin-bottom: 30px;"><i class="fas fa-list-ul" style="margin-right: 10px; color: var(--e-global-color-accent);"></i> Technical Specifications</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 0 30px;">
            ${specsEngHtml}
        </div>
    </div>

    <!-- Bottom: WhatsApp Order Form -->
    <div style="background: #fff; padding: 40px 20px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); max-width: 800px; margin: 0 auto; border-top: 5px solid #25D366; position: relative;">
        <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: #25D366; width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #fff; font-size: 30px; box-shadow: 0 5px 15px rgba(37,211,102,0.3);">
            <i class="fab fa-whatsapp"></i>
        </div>
        <h3 style="font-size: 28px; color: var(--e-global-color-primary); margin-bottom: 10px; margin-top: 15px; text-align: center;">Order via WhatsApp</h3>
        <p style="text-align: center; color: #777; margin-bottom: 40px; font-size: 15px;">Fill out your details to place a direct order for <b>${product.titleEng}</b>.</p>
        
        <form id="whatsapp-order-form" style="display: flex; flex-direction: column; gap: 25px;">
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">Full Name *</label>
                    <input type="text" id="wa-name" required placeholder="Ex: John Doe" style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
                <div style="flex: 1; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">Phone Number *</label>
                    <input type="tel" id="wa-phone" required placeholder="Ex: +1 234 567 890" style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
            </div>
            
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">Quantity *</label>
                    <input type="number" id="wa-qty" min="1" value="1" required style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">Delivery Address *</label>
                    <input type="text" id="wa-address" required placeholder="City, Street, Building..." style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
            </div>
            
            <div>
                <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">Order Notes (Optional)</label>
                <textarea id="wa-notes" rows="3" placeholder="Any specific requirements or instructions..." style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;"></textarea>
            </div>
            
            <button type="submit" style="background: #25D366; color: #fff; border: none; padding: 18px; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(37,211,102,0.3); display: flex; justify-content: center; align-items: center; gap: 10px;" onmouseover="this.style.background='#1ebc59'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#25D366'; this.style.transform='translateY(0)';">
                <i class="fab fa-whatsapp" style="font-size: 22px;"></i> Send Order via WhatsApp
            </button>
        </form>
    </div>
    </div>
    
    <script>
    document.addEventListener("DOMContentLoaded", () => {
        const mainImg = document.getElementById("main-product-img");
        const thumbs = document.querySelectorAll(".gallery-thumb");
        thumbs.forEach(t => {
            t.addEventListener("click", () => {
                mainImg.src = t.getAttribute("data-full");
                thumbs.forEach(thumb => thumb.style.borderColor = "transparent");
                t.style.borderColor = "var(--e-global-color-primary)";
            });
        });

        const form = document.getElementById("whatsapp-order-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const name = document.getElementById("wa-name").value;
                const phone = document.getElementById("wa-phone").value;
                const qty = document.getElementById("wa-qty").value;
                const address = document.getElementById("wa-address").value;
                const notes = document.getElementById("wa-notes").value;
                
                const titleEng = \`${product.titleEng}\`;
                const id = \`${product.id}\`;
                const message = \`New Order for Product: \${titleEng} (Code: \${id})\\nName: \${name}\\nPhone: \${phone}\\nQuantity: \${qty}\\nAddress: \${address}\\nNotes: \${notes ? notes : 'None'}\`;
                
                const waUrl = \`https://wa.me/\${'${PHONE_NUMBER}'}?text=\${encodeURIComponent(message)}\`;
                window.open(waUrl, "_blank");
            });
        }
    });
    </script>
    `;
    
    let finalEng = baseEngTemplate.replace('<!-- SEO_META_TAGS -->', seoEng).replace('<!-- PRODUCT_CONTENT -->', contentEng);
    finalEng = finalEng.replace(/\{\{ARABIC_LINK\}\}/g, `product-${slug}-ar.html`);
    if (!skipEng) {
        fs.writeFileSync(engFilePath, finalEng, 'utf8');
    }
    
    // ==========================================
    // ARABIC PAGE
    // ==========================================
    let urlAr = `${SITE_URL}/product-${slug}-ar.html`;
    
    // SEO block Ar
    let seoAr = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <title>${product.titleAr} | ${product.categoryAr} | V Smart Solutions</title>
    <meta name="description" content="${product.shortDescAr}" />
    <link rel="canonical" href="${urlAr}" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${product.titleAr} | V Smart Solutions" />
    <meta property="og:description" content="${product.shortDescAr}" />
    <meta property="og:image" content="${SITE_URL}/${cleanMainImgUrl}" />
    <meta property="og:url" content="${urlAr}" />
    <meta property="og:site_name" content="V Smart Solutions" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${product.titleAr} | V Smart Solutions" />
    <meta name="twitter:description" content="${product.shortDescAr}" />
    <meta name="twitter:image" content="${SITE_URL}/${cleanMainImgUrl}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "${product.titleAr}",
      "image": ${JSON.stringify(product.images.map(img => SITE_URL + '/' + getCleanImgUrl(img)))},
      "description": "${product.shortDescAr}",
      "sku": "${product.id}",
      "brand": {
        "@type": "Brand",
        "name": "V Smart Solutions"
      },
      "offers": {
        "@type": "Offer",
        "url": "${urlAr}",
        "priceCurrency": "USD",
        "price": "${product.price}",
        "availability": "https://schema.org/InStock"
      }
    }
    </script>
    `;

    let badgeArHtml = product.saleBadgeAr ? `<div style="display:inline-block; margin-bottom:15px; background:var(--e-global-color-accent); color:#fff; padding:6px 15px; border-radius:20px; font-weight:bold; font-size:14px;">${product.saleBadgeAr}</div>` : '';
    let oldPriceArHtml = product.oldPrice ? `<span style="text-decoration:line-through; color:#999; font-size:18px; margin-right:15px;">$${product.oldPrice}</span>` : '';
    let specsArHtml = product.specs.map(s => `
        <div style="display: flex; gap: 15px; align-items: start; border-bottom: 1px solid #eee; padding: 12px 0;">
            <div style="flex: 1; font-weight: bold; color: #555; min-width: 0; word-break: break-word;">${s.keyAr}</div>
            <div style="flex: 1.5; color: #777; min-width: 0; word-break: break-word;">${s.valAr}</div>
        </div>
    `).join('');

    let contentAr = `
    <div class="e-con-inner" style="max-width: 1200px; margin: 0 auto; width: 100%; padding: 50px 20px; box-sizing: border-box;">
    <!-- Top Split Section -->
    <div style="display: flex; flex-wrap: wrap; gap: 50px; margin-bottom: 60px;">
        <!-- Right (Visuals) -->
        <div style="flex: 1; min-width: 300px; max-width: 600px;">
            <div style="background: #f9f9f9; padding: 30px; border-radius: 20px; border: 1px solid #eee; display: flex; justify-content: center; align-items: center; height: 450px; margin-bottom: 20px; position:relative;">
                <img id="main-product-img" src="${mainImg}" style="max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply;">
            </div>
            <div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;" id="thumbnail-container">
                ${thumbnailsArHtml}
            </div>
        </div>

        <!-- Left (Details) -->
        <div style="flex: 1; min-width: 300px;">
            <!-- Breadcrumbs -->
            <p style="color: #999; font-size: 13px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">
                <a href="../../BuiltUp/index-ar.html" style="color:#999; text-decoration:none;">الرئيسية</a> / 
                <a href="../../BuiltUp/products-ar.html" style="color:#999; text-decoration:none;">المنتجات</a> / 
                <span style="color:var(--e-global-color-primary); font-weight:bold;">${product.categoryAr}</span>
            </p>
            
            ${badgeArHtml}
            <h1 style="font-size: 36px; color: var(--e-global-color-primary); margin-bottom: 15px; line-height: 1.3; font-weight: 800;">${product.titleAr}</h1>
            <p style="color: #777; margin-bottom: 20px; font-size: 14px;">كود المنتج: <span style="font-weight:bold; color: #444;">${product.id}</span></p>
            ${starsArHtml}
            <div style="display: flex; align-items: center; margin-bottom: 30px; gap: 10px;">
                <span style="font-size: 36px; font-weight: bold; color: var(--e-global-color-accent);">$${product.price}</span>
                ${oldPriceArHtml}
            </div>
            <p style="font-size: 18px; line-height: 1.8; color: #555; margin-bottom: 40px;">${product.shortDescAr}</p>
            
            <a href="${product.pdfCatalogAr}" target="_blank" style="display: inline-flex; align-items: center; padding: 15px 35px; background: var(--e-global-color-primary); color: #fff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" onmouseover="this.style.background='var(--e-global-color-accent)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='var(--e-global-color-primary)'; this.style.transform='translateY(0)';">
                <i class="fas fa-file-pdf" style="margin-left: 12px; font-size: 20px;"></i> تحميل الكتالوج
            </a>
        </div>
    </div>

    <!-- Middle Section: Description & Video -->
    <div style="border-top: 1px solid #eee; padding-top: 60px; margin-bottom: 60px;">
        <h3 style="font-size: 24px; color: var(--e-global-color-primary); margin-bottom: 25px; font-weight: 800;">نظرة عامة</h3>
        <p style="color: #555; line-height: 1.9; font-size: 18px;">${product.longDescAr}</p>
        ${videoArHtml}
    </div>

    <!-- Specs Grid -->
    <div style="background: #fcfcfc; padding: 30px 20px; border-radius: 20px; border: 1px solid #eee; margin-bottom: 60px;">
        <h3 style="font-size: 24px; color: var(--e-global-color-primary); margin-bottom: 30px; font-weight: 800;"><i class="fas fa-list-ul" style="margin-left: 10px; color: var(--e-global-color-accent);"></i> المواصفات الفنية</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 0 30px;">
            ${specsArHtml}
        </div>
    </div>

    <!-- Bottom: WhatsApp Order Form -->
    <div style="background: #fff; padding: 40px 20px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); max-width: 800px; margin: 0 auto; border-top: 5px solid #25D366; position: relative;">
        <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: #25D366; width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #fff; font-size: 30px; box-shadow: 0 5px 15px rgba(37,211,102,0.3);">
            <i class="fab fa-whatsapp"></i>
        </div>
        <h3 style="font-size: 28px; color: var(--e-global-color-primary); margin-bottom: 10px; margin-top: 15px; text-align: center; font-weight: 800;">اطلب عبر واتساب</h3>
        <p style="text-align: center; color: #777; margin-bottom: 40px; font-size: 16px;">قم بملء البيانات الآتية لإرسال طلب مباشر لمنتج <b>${product.titleAr}</b>.</p>
        
        <form id="whatsapp-order-form" style="display: flex; flex-direction: column; gap: 25px;">
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">الاسم الكامل *</label>
                    <input type="text" id="wa-name" required placeholder="مثال: أحمد محمد" style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
                <div style="flex: 1; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">رقم الهاتف *</label>
                    <input type="tel" id="wa-phone" required placeholder="مثال: +201xxxxxxxxx" style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
            </div>
            
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">الكمية *</label>
                    <input type="number" id="wa-qty" min="1" value="1" required style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
                <div style="flex: 2; min-width: 250px;">
                    <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">عنوان الاستلام *</label>
                    <input type="text" id="wa-address" required placeholder="المدينة، الشارع، المبنى..." style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;">
                </div>
            </div>
            
            <div>
                <label style="display: block; font-weight: bold; color: #444; margin-bottom: 8px;">ملاحظات إضافية (اختياري)</label>
                <textarea id="wa-notes" rows="3" placeholder="أي متطلبات خاصة أو تعليمات..." style="width: 100%; box-sizing: border-box; border: 1px solid #ddd; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 15px; background: #fafafa;"></textarea>
            </div>
            
            <button type="submit" style="background: #25D366; color: #fff; border: none; padding: 18px; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(37,211,102,0.3); display: flex; justify-content: center; align-items: center; gap: 10px;" onmouseover="this.style.background='#1ebc59'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#25D366'; this.style.transform='translateY(0)';">
                <i class="fab fa-whatsapp" style="font-size: 22px;"></i> إرسال الطلب عبر واتساب
            </button>
        </form>
    </div>
    </div>
    
    <script>
    document.addEventListener("DOMContentLoaded", () => {
        const mainImg = document.getElementById("main-product-img");
        const thumbs = document.querySelectorAll(".gallery-thumb");
        thumbs.forEach(t => {
            t.addEventListener("click", () => {
                mainImg.src = t.getAttribute("data-full");
                thumbs.forEach(thumb => thumb.style.borderColor = "transparent");
                t.style.borderColor = "var(--e-global-color-primary)";
            });
        });

        const form = document.getElementById("whatsapp-order-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const name = document.getElementById("wa-name").value;
                const phone = document.getElementById("wa-phone").value;
                const qty = document.getElementById("wa-qty").value;
                const address = document.getElementById("wa-address").value;
                const notes = document.getElementById("wa-notes").value;
                
                const titleAr = \`${product.titleAr}\`;
                const id = \`${product.id}\`;
                const message = \`طلب جديد لمنتج: \${titleAr} (كود: \${id})\\nالاسم: \${name}\\nالهاتف: \${phone}\\nالكمية: \${qty}\\nالعنوان: \${address}\\nملاحظات: \${notes ? notes : 'لا يوجد'}\`;
                
                const waUrl = \`https://wa.me/\${'${PHONE_NUMBER}'}?text=\${encodeURIComponent(message)}\`;
                window.open(waUrl, "_blank");
            });
        }
    });
    </script>
    `;

    let finalAr = baseArTemplate.replace('<!-- SEO_META_TAGS -->', seoAr).replace('<!-- PRODUCT_CONTENT -->', contentAr);
    finalAr = finalAr.replace(/\{\{ENGLISH_LINK\}\}/g, `product-${slug}.html`);
    if (!skipAr) {
        fs.writeFileSync(arFilePath, finalAr, 'utf8');
    }
    
    console.log(`Generated ${slug}`);
});
console.log("All products generated successfully!");
