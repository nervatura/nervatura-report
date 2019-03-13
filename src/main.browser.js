/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2019, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

import NtReport from './report'
import JsDocument from './jspdf'
//import fonts from '../fonts/fonts.json'

class Report extends NtReport {
	constructor(_orientation, _unit, _format) {
    
    let options = { 
      orientation: _orientation || "portrait",
      unit: _unit || "mm",
      format: _format || "a4",
      textFilter: [["Ő","Ô"],["ő","ô"],["Ű","Û"],["ű","û"]],
      fontFamily: "times", fontSize: 11
    }
    let _fonts = []
    /*
    let _fontName = Object.keys(fonts)
    _fontName.forEach(name => {
      ["normal","bold","italic","bolditalic"].forEach(style => {
        if(fonts[name][style]){
          _fonts.push({
            fileName: name+"-"+style+".ttf", base64Font: fonts[name][style],
            fontName: name+"-"+style, fontStyle: style})
        }  
      });
    });
    */
    super(options);
    this.doc = new JsDocument({
      orientation: this.orientation, unit: this.defUnit, format: this.format,
      textColor: this.template.style.color, drawColor: this.template.style["border-color"],
      fontFamily: "times", fontSize: this.template.style["font-size"], fonts: _fonts,
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
    this.doc.pdf.save(fileName);
  }

  save2DataUrl(){
    this.doc.pdf.output('dataurlnewwindow');
  }

}

export default Report