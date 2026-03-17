const pdf = require('pdf-parse');
console.log('Main keys:', Object.keys(pdf));

async function run() {
  try {
    // If it's a function directly (it's not, we checked)
    if (typeof pdf === 'function') {
      console.log('pdf is function');
    }
    
    // Check if it has a property that is a function
    for (let key of Object.keys(pdf)) {
        if (typeof pdf[key] === 'function') {
            console.log(`pdf.${key} is a function/class`);
        }
    }
    
    // Often there's an 'extractText' or similar
    // But let's check the constructor
    if (pdf.PDFParse) {
        console.log('Trying new pdf.PDFParse()...');
    }
  } catch (e) {
    console.error(e);
  }
}
run();
