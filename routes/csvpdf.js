var express = require('express');
var router = express.Router();
const PDFDocument = require('pdfkit');

router.get('/multifileupload', function (req, res) {
  res.render('csvpdf/multifileupload', { layout: 'frontlayout', errors: '', title: "Login" });
});

/** multiple file upload with form data **/
router.post('/multifileupload', function (req, res) {
  var multiparty = require('multiparty');
  var form = new multiparty.Form();
  var fs = require('fs');

  form.parse(req, function (err, fields, files) {
    var imgArray = files.imagef;

    // here fields param hold all form fields and files param hold all multipart data

    for (var i = 0; i < imgArray.length; i++) {
      var newPath = 'public/images/uploads/' + i + '/';
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
      }
      var singleImg = imgArray[i];
      newPath += Date.now() + "==" + singleImg.originalFilename;
      readAndWriteFile(singleImg, newPath);
    }
    console.log(fields);
    res.send("File uploaded to: " + newPath);
  });

  function readAndWriteFile(singleImg, newPath) {
    fs.readFile(singleImg.path, function (err, data) {
      fs.writeFile(newPath, data, function (err) {
        if (err) console.log('ERRRRRR!! :' + err);
        console.log('Fitxer: ' + singleImg.originalFilename + ' - ' + newPath);
      })
    })
  }

});

router.get('/pdf', function (req, res) {
  res.render('csvpdf/pdf', { layout: 'frontlayout', errors: '', title: "CSV" });
});

// Generate PDF as per entered content in the form
router.post('/pdf', function (req, res) {
  const doc = new PDFDocument()
  let filename = req.body.filename
  // Stripping special characters
  filename = encodeURIComponent(filename) + '.pdf'
  // Setting response to 'attachment' (download).
  // If you use 'inline' here it will automatically open the PDF
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
  res.setHeader('Content-type', 'application/pdf')
  const content = req.body.content
  doc.y = 300
  doc.text(content, 50, 50)
  doc.pipe(res)
  doc.end();
});

router.get('/csv', function (req, res, next) {
  var fs = require('fs');
  var csv = require("fast-csv");
  var stream = fs.createReadStream('public/staticcsv/test.csv');

  var csvStream = csv()
    .on("data", function (data) {
      //res.send(data);
      console.log(data);
    })
    .on("end", function () {
      console.log("done");
    });

  stream.pipe(csvStream);
  res.send(csvStream);
});

module.exports = router;