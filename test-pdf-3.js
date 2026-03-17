const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    console.log('Testing PDFParse function...');
    // We don't have a real pdf buffer here easily, but let's see if it's a constructor or function
    console.log(PDFParse);
  } catch (e) {
    console.error(e);
  }
}
test();
