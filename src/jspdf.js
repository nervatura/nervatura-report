/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2019, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

import jsPDF from 'jspdf'

export default class JsDocument {
  constructor(options) {
    this.pdf = new jsPDF({
      orientation: options.orientation, unit: options.unit, format: options.format,
      textColor: options.textColor, drawColor: options.drawColor,
      fontSize: options.fontSize});
    this.pdf.internal.events.subscribe('addPage', (page) => options.pageCallback(page.pageNumber) )

    options.fonts.forEach(font => {
      this.pdf.addFileToVFS(font.fileName, font.base64Font);
      this.pdf.addFont(font.fileName, font.fontName, font.fontStyle);
    })

  }

  get pageSize(){
    return {
      height: this.pdf.internal.pageSize.height,
      width: this.pdf.internal.pageSize.width
    }
  }
  
  get scaleFactor() {
    return this.pdf.internal.scaleFactor
  }

  addPage(options){
    this.pdf.addPage(options)
  }

  addImage(image, x, y, options){
    this.pdf.addImage(image, "", x, y, options.width, options.height, options.alias, options.compression);
  }

  getFontSize() {
    return this.pdf.internal.getFontSize()
  }

  getLineHeight(text) {
    return this.pdf.internal.getLineHeight()
  }

  getTextWidth(text) {
    return this.pdf.getStringUnitWidth(text)
  }

  setDrawColor(color) {
    this.pdf.setDrawColor(color);
  }

  setFont(fontFamily) {
    const _fonts = this.pdf.getFontList()
    if(typeof _fonts[fontFamily] !== "undefined")
      this.pdf.setFont(fontFamily);
  }

  setFontType(fontStyle) {
    switch(fontStyle) {
      case "bold":
      case "italic":
      case "bolditalic":
      case "normal":
        this.pdf.setFontType(fontStyle)
        break;
      default:
        this.pdf.setFontType("normal");
    }
  }

  setFontSize(fontSize) {
    this.pdf.setFontSize(fontSize);
  }

  setFillColor(color) {
    this.pdf.setFillColor(color);
  }

  setProperties(options){
    let params = {}
    if(options.title)
      params.title = options.title;
    if(options.author)
      params.author = options.author;
    if(options.subject)
      params.subject = options.subject;
    if(options.creator)
      params.subject= options.creator;
    this.pdf.setProperties(params);
  }

  setTextColor(color) {
    this.pdf.setTextColor(color);
  }

  text(value, x, y, options) {
    this.pdf.text(String(value), x, y)
    //angle, align, renderingMode, maxWidth
  }

  rect(x, y, width, height, style) {
    this.pdf.rect(x, y, width, height, style);
  }

  line(x1, y1, x2, y2){
    this.pdf.line(x1, y1, x2, y2);
  }

  fromHTML(HTML, x, y, settings, callback, margins) {
    this.pdf.fromHTML(HTML, x, y, settings, (dispose) => {
      callback(dispose); }, margins)
  }
  
  splitTextToSize(text, maxlen, options) {
    return this.pdf.splitTextToSize(text, maxlen)
  }
  
  save2DataUrlString(callback, _filename) {
    if(callback)
      callback(this.pdf.output('dataurlstring',{ filename: _filename }))
    else
      return this.pdf.output('dataurlstring',{ filename: _filename })
  }

  save2Pdf(callback) {
    if(callback)
      callback(this.pdf.output('arraybuffer'));
    else
      return this.pdf.output('arraybuffer');
  }

}