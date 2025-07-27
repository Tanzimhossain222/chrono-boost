#!/usr/bin/env node

import { build } from 'vite';
import fs from 'fs-extra';
import path from 'path';

async function buildExtension() {
  console.log('🚀 Building Chrome Extension...');
  
  // Build the main app
  await build();
  
  // Copy extension files to dist
  console.log('📁 Copying extension files...');
  
  const extensionFiles = [
    'public/manifest.json',
    'public/background.js',
    'public/options.html'
  ];
  
  for (const file of extensionFiles) {
    if (fs.existsSync(file)) {
      const filename = path.basename(file);
      fs.copySync(file, `dist/${filename}`);
      console.log(`✅ Copied ${filename}`);
    }
  }
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync('dist/icons')) {
    fs.mkdirSync('dist/icons');
  }
  
  // Copy or generate icons
  const iconSizes = [16, 48, 128];
  const sourceIcon = 'src/assets/pomodoro-icon.png';
  
  if (fs.existsSync(sourceIcon)) {
    for (const size of iconSizes) {
      fs.copySync(sourceIcon, `dist/icons/pomodoro-${size}.png`);
      console.log(`✅ Copied icon ${size}x${size}`);
    }
  }
  
  console.log('🎉 Chrome Extension build complete!');
  console.log('📦 Extension files are in the "dist" directory');
  console.log('📌 To load in Chrome: Go to chrome://extensions/, enable Developer mode, and click "Load unpacked"');
}

buildExtension().catch(console.error);