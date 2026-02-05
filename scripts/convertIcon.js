const fs = require('fs');
const path = require('path');

// Read SVG file
const svgPath = path.join(__dirname, '../public/icon.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

// Create HTML file that will render and export the PNG
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SVG to PNG Converter</title>
</head>
<body>
  <div id="container"></div>
  <script>
    const sizes = [192, 512];
    const svg = ${JSON.stringify(svg)};

    sizes.forEach(size => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      const svgElement = doc.documentElement;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, size, size);
        const pngUrl = canvas.toDataURL('image/png');

        // Download the image
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'icon-' + size + '.png';
        a.click();
      };

      const svgBlob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
      const svgUrl = URL.createObjectURL(svgBlob);
      img.src = svgUrl;
    });
  </script>
</body>
</html>
`;

// Write HTML file
const htmlPath = path.join(__dirname, '../public/convert.html');
fs.writeFileSync(htmlPath, html);

console.log('HTML converter created at public/convert.html');
console.log('Open this file in a browser to download the PNG files.');
