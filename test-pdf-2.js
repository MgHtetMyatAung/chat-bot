const pdf = require('pdf-parse');
console.log('PDFParse type:', typeof pdf.PDFParse);
if (typeof pdf === 'function') {
  console.log('pdf is a function');
} else if (pdf.default && typeof pdf.default === 'function') {
  console.log('pdf.default is a function');
} else {
  console.log('Neither is a function');
}
