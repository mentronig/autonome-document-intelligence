
const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = process.argv[2];

if (!pdfPath) {
    console.error("No PDF path provided");
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    console.log(JSON.stringify({
        text: data.text,
        numpages: data.numpages,
        info: data.info
    }));
}).catch(function (error) {
    console.error(error);
    process.exit(1);
});
