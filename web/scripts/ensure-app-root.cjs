const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, '..', 'src', 'app');

if (fs.existsSync(srcAppDir)) {
  console.error('❌ Found web/src/app/. Please move all routes to web/app/.');
  process.exit(1);
}
