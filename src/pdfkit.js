/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2019, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

import PDFDocument from 'pdfkit'
import { DOMParser } from 'xmldom';

const _getBuffer = Symbol('getBuffer');
const _rgb2Hex = Symbol('rgb2Hex');

export default class KitDocument {
  constructor(options) {

    this.pdf = new PDFDocument({
      size: (options.format) ? String(options.format).toUpperCase() : "A4",
      layout : options.orientation || "portrait",
      margin: 0
    });
    this.pdf.on('pageAdded', () => {
      this.state.pageNumber += 1; options.pageCallback(this.state.pageNumber)} );

    //this.pdf.registerFont('Roboto', 'fonts/RobotoSlab-Regular.ttf');
    //this.pdf.registerFont('Roboto-Bold', 'fonts/RobotoSlab-Bold.ttf');
    //this.pdf.registerFont('Roboto-Italic', 'fonts/Roboto-Italic.ttf');
    //this.pdf.registerFont('Roboto-BoldItalic', 'fonts/Roboto-BoldItalic.ttf');
    
    this.fontMap = {
      courier: {
        normal: "Courier",
        bold: "Courier-Bold",
        italic: "Courier-Oblique",
        bolditalic: "Courier-BoldOblique"
      },
      helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italic: "Helvetica-Oblique",
        bolditalic: "Helvetica-BoldOblique"
      },
      times: {
        normal: "Times-Roman",
        bold: "Times-Bold",
        italic: "Times-Italic",
        bolditalic: "Times-BoldItalic"
      }
    }

    options.fonts.forEach(font => {
      this.pdf.registerFont(font.fontName, font.bufferFont);
      if(!this.fontMap[font.fontFamily])
        this.fontMap[font.fontFamily] = {}
      this.fontMap[font.fontFamily][font.fontStyle] = font.fontName;
    });

    this.state = {
      font: {
        family: "times",
        style: "normal",
        size: options.fontSize || 10,
        textColor: options.textColor || "#000000",
        fillColor: "#ffffff",
        drawColor: options.drawColor || "#000000"
      },
      pageNumber: 1
    }
    if(options.fontFamily)
      this.setFont(options.fontFamily)
    this.bufferSize = 9007199254740991;

  }
  
  [_getBuffer](callback) {
		if (!callback) {
			throw new Error('getBuffer is an async method and needs a callback argument');
		}

		let chunks = [];
		let result;
		this.pdf.on('readable', () => {
			let chunk;
			while ((chunk = this.pdf.read(this.bufferSize)) !== null) {
				chunks.push(Buffer(chunk));
			}
		});
		this.pdf.on('end', () => {
			result = Buffer.concat(chunks);
			callback(result);
		});
		this.pdf.end();
  }
  
  [_rgb2Hex](red, green, blue){
    const dec2hex = (dec) => {
      return Number(parseInt(dec,10)).toString(16); }
    const pad = (h) => {
      if(h.length==1) return "0"+h;
      else return h; }
    return "#"+pad(dec2hex(red))+pad(dec2hex(green))+pad(dec2hex(blue));  
  }

  get fontName(){
    return this.fontMap[this.state.font.family][this.state.font.style]
  }

  get pageSize(){
    return {
      height: this.pdf.page.height,
      width: this.pdf.page.width
    }
  }

  get scaleFactor() {
    return 1;
  }

  addPage(options){
    this.pdf.addPage(options)
  }

  addImage(image, x, y, options){
    this.pdf.image(image, x, y, options);
  }

  getFontSize() {
    return this.state.font.size;
  }
  
  getLineHeight() {
    return this.pdf.currentLineHeight(true)
  }

  getTextWidth(text) {
    return this.pdf.widthOfString(text)/this.state.font.size;
  }

  setDrawColor(color) {
    if(Number.isInteger(color))
      color = this[_rgb2Hex](color, color, color)
    this.state.font.drawColor = color
  }

  setFont(fontFamily) {
    if(this.fontMap[fontFamily]){
      try {
        this.pdf.font(this.fontName);
        this.state.font.family = fontFamily;
      } catch (error) {
        this.state.font.family = "times"
      }
    }
  }

  setFontType(fontStyle) {
    switch(fontStyle) {
      case "bold":
      case "italic":
      case "bolditalic":
      case "normal":
        this.state.font.style = fontStyle;
        break;
      default:
        this.state.font.style = "normal";
    }
    this.setFont(this.fontName);
  }

  setFontSize(fontSize) {
    this.state.font.size = fontSize;
    this.pdf.fontSize(fontSize);
  }

  setFillColor(color) {
    if(Number.isInteger(color))
      color = this[_rgb2Hex](color, color, color)
    this.state.font.fillColor = color
  }

  setProperties(options){
    if(options.title)
      this.pdf.info.Title = options.title;
    if(options.author)
      this.pdf.info.Author = options.author;
    if(options.subject)
      this.pdf.info.Subject = options.subject;
    if(options.keywords)
      this.pdf.info.Keywords = options.keywords;
  }

  setTextColor(color) {
    this.state.font.textColor = color
    this.pdf.fillColor(color)
  }

  text(value, x, y, options) {
    options = options || {}
    options.baseline = 0;
    this.pdf.font(this.fontName).fillColor(this.state.font.textColor).text(value, x, y, options);
    //width: Number
    //align: 'left', 'center', 'right', 'justify'
  }

  rect(x, y, width, height, style) {
    if(style === "F")
      this.pdf.rect(x, y, width, height).fill(this.state.font.fillColor)
    else
      this.pdf.rect(x, y, width, height).stroke(this.state.font.drawColor)
  }

  line(x1, y1, x2, y2){
    this.pdf.moveTo(x1, y1).lineTo(x2, y2).stroke(this.state.font.drawColor)
  }

  fromHTML(HTML, x, y, settings, callback, margins) {
    let doc = new DOMParser().parseFromString(HTML, "text/html");
    let txt = "\n"
    for (let index = 0; index < doc.childNodes.length; index++) {
      const element = doc.childNodes[index];
      txt += String(element.textContent).trim()+"\n"
    }
    this.text(txt, x, y, { width: settings.width });
    callback({ y: this.pdf.y })
  }

  splitTextToSize(text, maxlen, options) {
    return this.pdf.heightOfString(text, { width: maxlen, baseline: 0 });
  }

  save2DataUrlString(callback, filename){
    this[_getBuffer]((buffer) => {
      filename = (filename) ? "filename="+filename+";" : ""
      callback('data:application/pdf;'+filename+'base64,'+buffer.toString('base64'));
    })
  }

  save2Pdf(callback) {
    this[_getBuffer]((buffer) => {
      let arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset, buffer.byteOffset + buffer.byteLength )
      callback(arrayBuffer);
    })
  }

}