
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { extname } from 'path';
import { createJsReport } from '../examples/sample'
import Report from '../dist/report.node'
//import Report from '../src/main.node'

const getImageFile = (file) => {
  let image = ""
  if (existsSync(file)) {
    let _extname = extname(file).substr(1)
    if((_extname === "jpg") || (_extname === "png"))
      image = "data:image/"+_extname+";base64,"+Buffer.from(readFileSync(file)).toString('base64');
  }
  return image;
}

describe('pdfkit-node test', () => {
  
  it("pdfkit-node Javascript/save2PdfFile getXmlTemplate save2Xml", () => {
    let rpt = createJsReport(new Report(), getImageFile("examples/logo.jpg"));
    rpt.createReport();
    writeFileSync('./test/output/pdfkit-node-template.xml', rpt.getXmlTemplate());
    writeFileSync('./test/output/pdfkit-node-data.xml', rpt.save2Xml());
    rpt.save2PdfFile("./test/output/pdfkit-node-js.pdf")
  })

  it("pdfkit-node loadJsonDefinition/save2Pdf", () => {
    let rpt = new Report("landscape");
    let json_template = readFileSync("examples/sample.json", "utf8").toString()
    rpt.loadJsonDefinition(json_template);
    rpt.createReport();
    rpt.save2Pdf((pdf) => {
      writeFileSync("./test/output/pdfkit-node-json.pdf", new Buffer(pdf));
    });
  })

  it("pdfkit-node loadDefinition/save2PdfFile", () => {
    let rpt = new Report();
    let xml_template = readFileSync("examples/sample.xml", "utf8").toString()
    rpt.loadDefinition(xml_template);
    rpt.createReport();
    rpt.save2PdfFile("./test/output/pdfkit-node-xml.pdf")
  })

})
