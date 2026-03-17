const pdf = require('pdf-parse');
console.log('PDFParse:', pdf.PDFParse);
const parser = new pdf.PDFParse();
console.log('Parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
