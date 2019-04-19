Nervatura Report
====================
Client/server side JavaScript PDF generation library for Node and the browser.
  * **Client/server side**: PDF printing in pure JavaScript - using the [jsPDF](https://github.com/MrRio/jsPDF) (browser) and [PDFKit](https://github.com/foliojs/pdfkit) (Node.js) libraries
  * **Fully declarative**: can be easily modified and used for relative layout (no need to specify the x and y coordinates)
  * **Powerful layout engine**: row, datagrid, column, cell, image, separator, html, barcode, hline, vgap elements
  * **Many types of declaration**: XML, JSON, Javascript
  * **Several output options**: PDF, XML

### Quick Start
* ***Browser-friendly UMD build***

      <script src="report.browser.js"></script>

  See example: 
  
      git clone https://github.com/nervatura/nervatura-report.git
      cd nervatura-report
      npm install

  and open the *[test/browser.test.html](https://github.com/nervatura/nervatura-report/tree/master/test)*

* ***Client side ES module (Angular/Webpack/React/etc.)***

  **npm install --save nervatura-report jspdf**

      import Report from 'nervatura-report/dist/report.module'

      let rpt = new Report();
      rpt.loadJsonDefinition('json_template');
      rpt.createReport();
      rpt.save2Pdf((pdf) => { /** **/ })

  See example: *[nervatura-react](https://github.com/nervatura/nervatura-react)*

* ***CommonJS (for Node) build***

  **npm install --save nervatura-report pdfkit xmldom**

      import Report from 'nervatura-report/dist/report.node'

      let rpt = new Report("landscape");
      rpt.loadDefinition('xml_template');
      rpt.createReport();
      rpt.save2PdfFile("pdf_path/sample.pdf")

  See example: *[test/node.test.js](https://github.com/nervatura/nervatura-report/tree/master/test)* or *[nervatura-express](https://github.com/nervatura/nervatura-express)*

### Docs & Community

[Report API](https://htmlpreview.github.io/?https://github.com/nervatura/nervatura-report/blob/master/docs/report.html)

More Resources and Sample Applications: [Nervatura Framework](https://github.com/nervatura/nervatura)