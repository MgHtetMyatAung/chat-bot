const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (filePath.endsWith('.node') || filePath.includes('node_modules') || filePath.includes('.git')) return;
    try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const files = fs.readdirSync(filePath);
            files.forEach(file => replaceInFile(path.join(filePath, file)));
        } else if (stats.isFile()) {
            const content = fs.readFileSync(filePath, 'utf8');
            const newContent = content.replace(/Nexus AI/g, 'May Myan AI');
            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    } catch (err) {
        // Ignored
    }
}

replaceInFile('./src');
replaceInFile('./public');
console.log('Finished renaming.');
