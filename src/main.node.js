/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2019, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

import { createWriteStream, readFileSync, existsSync } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';
import NtReport from './report'
import KitDocument from './pdfkit'

export default class Report extends NtReport {
	constructor(_orientation, _unit, _format) {
    
    let options = { 
      orientation: _orientation || "portrait",
      unit: _unit || "mm",
      format: _format || "a4",
      textFilter: [],
      fontFamily: "roboto", fontSize: 10
    }
    let _fonts = []
    let _fontFiles = [
      { name: "Roboto", family: "roboto", style: "normal", file: "RobotoSlab-Regular.ttf" },
      { name: "Roboto-Bold", family: "roboto", style: "bold", file: "RobotoSlab-Bold.ttf" },
      { name: "Roboto-Italic", family: "roboto", style: "italic", file: "Roboto-Italic.ttf" },
      { name: "Roboto-BoldItalic", family: "roboto", style: "bolditalic", file: "Roboto-BoldItalic.ttf" }
    ]
    _fontFiles.forEach(_font => {
      if (existsSync(__dirname+"/../fonts/"+_font.file)) {
        _fonts.push({ 
          fontName: _font.name, fontFamily: _font.family, fontStyle: _font.style,
          bufferFont: readFileSync(__dirname+"/../fonts/"+_font.file)
        })
      }
    });
    super(options);
    this.doc = new KitDocument({
      orientation: this.orientation, unit: this.defUnit, format: this.format,
      textColor: this.template.style.color, drawColor: this.template.style["border-color"],
      fontFamily: "roboto", fontSize: this.template.style["font-size"], fonts: _fonts,
      pageCallback: (pageNumber) => this.pageAdded(pageNumber)
    });
  }

  getXmlTemplate() {
    return super.getXmlTemplate(new DOMParser(), new XMLSerializer())
  }

  loadDefinition(data) {
    return super.loadDefinition(data, new DOMParser())
  }

  save2PdfFile(fileName){
    if(createWriteStream)
      this.doc.pdf.pipe(createWriteStream(fileName))
      this.doc.pdf.end();
  }
}