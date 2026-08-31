import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const inputDir = './public/images/professores';
const outputDir = './public/images/professores_nobg';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

async function processAll() {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.(jpeg|jpg)$/i, '.png'));
    console.log(`Processing ${file}...`);
    try {
      const blob = await removeBackground(inputPath);
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      console.log(`Saved to ${outputPath}`);
    } catch (e) {
      console.error(`Error on ${file}:`, e);
    }
  }
}

processAll();
