const fs = require('fs');
const path = require('path');

const filesToClean = [
    { name: 'products.html', startLine: 669, endLine: 2381 }, 
    { name: 'product-01.html', startLine: 669, endLine: 2381 },
    { name: 'products-ar.html', startLine: 672, endLine: 2744 }, 
    { name: 'product-01-ar.html', startLine: 672, endLine: 2744 }
];

filesToClean.forEach(f => {
    const fullPath = path.join('f:\\BuiltUp', f.name);
    let lines = fs.readFileSync(fullPath, 'utf8').split('\n');
        
    let part1 = lines.slice(0, f.startLine);
    let placeholder = `\t<!-- PRODUCT CONTENT INJECTED HERE -->\n\t<div id="product-root" class="elementor-section" style="padding: 100px 0; background: #fff;"></div>`;
    let part2 = lines.slice(f.endLine);
    
    let out = part1.join('\n') + '\n' + placeholder + '\n' + part2.join('\n');
    fs.writeFileSync(fullPath, out, 'utf8');
    console.log(`Cleaned ${f.name}`);
});
