'use strict';

var fs = require('fs');
var xmldom = require('xmldom');
var PDFDocument = require('pdfkit');

/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2019, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

const _barCode39 = Symbol('barCode39');
const _barInterleaved2of5 = Symbol('barInterleaved2of5');

const _checkBarchar = Symbol('checkBarchar');
const _checkPageBreak = Symbol('checkPageBreak');

const _createCell = Symbol('createCell');
const _createDatagrid = Symbol('createDatagrid');
const _createElements = Symbol('createElements');
const _createFooter = Symbol('createFooter');
const _createGridHeader = Symbol('createGridHeader');
const _createHeader = Symbol('createHeader');
const _createRow = Symbol('createRow');
const _createXmlElement = Symbol('createXmlElement');

const _getDefBarcodeSize = Symbol('getDefBarcodeSize');
const _getElementType = Symbol('getElementType');
const _getElementStyle = Symbol('getElementStyle');
const _getFooterHeight = Symbol('getFooterHeight');
const _getHeight = Symbol('getHeight');
const _getParent = Symbol('getParent');
const _getParentSection = Symbol('getParentSection');
const _getValue = Symbol('getValue');

const _parseJson = Symbol('parseJson');
const _parseReport = Symbol('parseReport');
const _parseValue = Symbol('parseValue');
const _parseXml = Symbol('parseXml');

const _setAttributes = Symbol('setAttributes');
const _setHex2greyscale = Symbol('setHex2greyscale');
const _setHtmlCursor = Symbol('setHtmlCursor');
const _setHtmlValue = Symbol('setHtmlValue');
const _setPageStyle = Symbol('setPageStyle');
const _setProperties = Symbol('setProperties');
const _setTextFilter = Symbol('setTextFilter');
const _setNumberFormat = Symbol('setNumberFormat');
const _setValue = Symbol('setValue');

class NtReport {
  constructor(options) {
    
    this.orientation = this[_parseValue]("orientation",options.orientation);
    this.unit = this[_parseValue]("unit",options.unit);
    this.format = this[_parseValue]("format",options.format);

    this.mm_pt = 2.83465;
    this.defUnit = "pt";

    this.template = {
      document:{
        title:"Nervatura Report",
        author:"",
        creator:"",
        subject:"",
        keywords:""
      },
      margins:{
        "left-margin": 12.7*this.mm_pt,
        "top-margin": 12.7*this.mm_pt,
        "right-margin": 12.7*this.mm_pt,
        "bottom-margin": 12.7*this.mm_pt
      },
      style: {
        "font-family": options.fontFamily || "times",
        "font-style": "normal",
        "font-size": options.fontSize || 11,
        color: "#000000",
        "border-color": 0,
        "background-color": 255
      },
      elements: {
        report: {}, 
        header: [],
        details: [],
        footer: [],
        data: {}
      },
      xml: {
        header: "",
        details: ""
      },
      page: {
        cursor: {x:0, y:0},
        padding: 2*this.mm_pt,
        header_height: 0,
        footer_height: 0,
        current_page: 1 }
    };
    this.orig_data = {};
    this.textFilter = options.textFilter || [];
  }

  // private
  [_barCode39](txt, w, h, visible) {
    w = w || 1.5*this.mm_pt; h = h || 5*this.mm_pt; visible = visible || false;
    let narrow = w / 3.0; let wide = w; let gap = narrow;
    let code = txt.toUpperCase();
    this.doc.setFontSize(10);
    let start_x = this.template.page.cursor.x;
    let bar_char={'0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw', '5': 'wnnwwnnnn',
              '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
              'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn', 'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn',
              'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn', 'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
              'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn', 'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn',
              'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw', 'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
              '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn', '$': 'nwnwnwnnn', '/': 'nwnwnnnwn',
              '+': 'nwnnnwnwn', '%': 'nnnwnwnwn'};
    if (!this[_checkBarchar](bar_char, txt)) {
      let err_str = 'Invalid barcode: '+txt;
      this.template.page.cursor.x+=this.template.page.padding;
      this.doc.text(err_str, this.template.page.cursor.x, this.template.page.cursor.y+(this.doc.getLineHeight()/this.doc.scaleFactor));
      this.template.page.cursor.x+=parseFloat(this.doc.getTextWidth(err_str)*this.doc.getFontSize()/this.doc.scaleFactor);
      this.template.page.cursor.x+=this.template.page.padding;
      return false;}
    
    for(let i = 0; i < code.length; i+=2) {
      let char_bar = code[i]; let seq = '';
      for(let s = 0; s < bar_char[char_bar].length; s++) {
        seq += bar_char[char_bar][s];}
      for(let bar = 0; bar < seq.length; bar++) {
        let line_width;
        if (seq[bar] === 'n') {
          line_width = narrow;}
        else {line_width = wide;}
        if (bar % 2 === 0)
          this.doc.rect(this.template.page.cursor.x, this.template.page.cursor.y, line_width, h, 'F');
        this.template.page.cursor.x += line_width;}}
    this.template.page.cursor.x += gap;
    if (visible) {
      let txt_w = parseFloat(this.doc.getTextWidth(txt)*this.doc.getFontSize()/this.doc.scaleFactor);
      start_x = start_x+(this.template.page.cursor.x-start_x-txt_w)/2;
      this.doc.text(txt, start_x, this.template.page.cursor.y+h+(this.doc.getFontSize()/this.doc.scaleFactor));}
    return true;
  }
  
  [_barInterleaved2of5](txt, w, h, visible) {
    w = w || 1*this.mm_pt; h = h || 10*this.mm_pt; visible = visible || false;
    let narrow = w / 3.0; let wide = w;
    this.doc.setFontSize(10);
    let start_x = this.template.page.cursor.x;
    let bar_char={
      '0': 'nnwwn', '1': 'wnnnw', '2': 'nwnnw', '3': 'wwnnn', '4': 'nnwnw', '5': 'wnwnn', '6': 'nwwnn', '7': 'nnnww',
      '8': 'wnnwn', '9': 'nwnwn', 'A': 'nn', 'Z': 'wn'};
    if (!this[_checkBarchar](bar_char, txt)) {
      let err_str = 'Invalid barcode: '+txt;
      this.template.page.cursor.x+=this.template.page.padding;
      this.doc.text(err_str, this.template.page.cursor.x, this.template.page.cursor.y+(this.doc.getLineHeight()/this.doc.scaleFactor));
      this.template.page.cursor.x+=parseFloat(this.doc.getTextWidth(err_str)*this.doc.getFontSize()/this.doc.scaleFactor);
      this.template.page.cursor.x+=this.template.page.padding;
      return false;}
    
    let code = txt;
    if (code.length % 2 !== 0)
      code = '0' + code;
    code = 'AA' + code.toLocaleLowerCase() + 'ZA';
    for(let i = 0; i < code.length; i+=2) {
      let char_bar = code[i]; let char_space = code[i+1]; let seq = '';
      for(let s = 0; s < bar_char[char_bar].length; s++) {
        seq += bar_char[char_bar][s] + bar_char[char_space][s];}
      for(let bar = 0; bar < seq.length; bar++) {
        let line_width;
        if (seq[bar] === 'n') {
          line_width = narrow;}
        else {line_width = wide;}
        if (bar % 2 === 0)
          this.doc.rect(this.template.page.cursor.x, this.template.page.cursor.y, line_width, h, 'F');
        this.template.page.cursor.x += line_width;}}
    if (visible) {
      let txt_w = parseFloat(this.doc.getTextWidth(txt)*this.doc.getFontSize()/this.doc.scaleFactor);
      start_x = start_x+(this.template.page.cursor.x-start_x-txt_w)/2;
      this.doc.text(txt, start_x, this.template.page.cursor.y+h+(this.doc.getFontSize()/this.doc.scaleFactor));}
    return true;}

  [_checkBarchar](bar_char, code) {
    for (let i=0; i<code.toString().length; i++) {
      let char_bar = code[i];
      if (!bar_char.hasOwnProperty(char_bar)) {return false;}}
    return true;
  }

  [_checkPageBreak](current_y, step) {
    let dline = this.doc.pageSize.height-this.template.margins["bottom-margin"];
    if (current_y < this.doc.pageSize.height-this.template.page.footer_height-this.template.margins["bottom-margin"]) {
      dline -= this.template.page.footer_height;}
    if (current_y+step>dline) {
      return true;} else {return false;}
  }

  [_createCell](options, header_options){
    //x, y, width, height, text, border, ln, align, padding, multiline, extend
    this[_setPageStyle](options);
    if ((typeof options.text==="undefined")||(options.text===null)) {
      options.text = "";}

    if ((typeof options.x==="undefined")||(options.x===null)) {
      options.x = parseFloat(this.template.page.cursor.x);}
    else {options.x = parseFloat(options.x);}
    if ((typeof options.y==="undefined")||(options.y===null)) {
      options.y = parseFloat(this.template.page.cursor.y);}
    else {options.y = parseFloat(options.y);}

    if ((typeof options.padding==="undefined")||(options.padding===null)) {
      options.padding = parseInt(this.template.page.padding,10);}
    else {options.padding = parseInt(options.padding,10);}
    if ((typeof options.multiline==="undefined")||(options.multiline===null)) {
      options.multiline = "false";}

    if ((typeof options.ln==="undefined")||(options.ln===null)) {
      options.ln = 0;}
    else {options.ln = parseInt(options.ln,10);}
    if (options.ln>0 && options.extend) {
      options.width = this.doc.pageSize.width - this.template.margins["right-margin"] -options.x;}
    else {
      if ((typeof options.width==="undefined")||(options.width===null)) {
        options.width = 
          parseFloat(this.doc.getTextWidth(options.text)*this.doc.getFontSize()/this.doc.scaleFactor+options.padding*2)+1;}
      else {
        if (options.width.toString().indexOf("%")>-1) {
          let nwidth = this.doc.pageSize.width-this.template.margins["right-margin"]-this.template.margins["left-margin"];
          options.width=nwidth*(parseFloat(options.width.toString().replace("%",""))/100);}
        else {
          options.width = parseFloat(options.width);}}
      if (options.x+options.padding+options.width > this.doc.pageSize.width - this.template.margins["right-margin"]) {
        options.width = this.doc.pageSize.width - this.template.margins["right-margin"] -options.x;}}
    if (options.width<0) {options.width=0; options.text="";}

    let theight = parseFloat(this.doc.getLineHeight()/this.doc.scaleFactor)+(options.padding);
    if ((typeof options.height==="undefined")||(options.height===null)) {
      options.height = theight; }
    else {
      if (theight > parseFloat(options.height)) {options.height = theight;} else {options.height = parseFloat(options.height);}}

    if (options.multiline==="true" && options.text!=="") {
      let mheight = this[_getHeight](options.text,options.width,options.padding,options["font-style"]); 
      options.text = mheight.text;
      if (mheight.height>options.height){options.height = mheight.height;}}

    if (this[_checkPageBreak](options.y, options.height)) {
      this.doc.addPage();
      if (typeof header_options!=="undefined"){
        this[_createGridHeader](header_options); options.x = parseFloat(this.template.page.cursor.x);}
      this[_setPageStyle](options); options.y = parseFloat(this.template.page.cursor.y);}

    if ((typeof options["background-color"]!=="undefined")&&(options["background-color"]!==null)) {
      this.doc.rect(options.x, options.y, options.width, options.height, "F");}

    if ((typeof options.border!=="undefined")&&(options.border!==null)) {
      if (options.border==="1") {
        this.doc.rect(options.x, options.y, options.width, options.height);}
      else {
        if (options.border.indexOf("L")>-1) {
          this.doc.line(options.x, options.y, options.x, options.y+options.height);}
        if (options.border.indexOf("R")>-1) {
          this.doc.line(options.x+options.width, options.y, options.x+options.width, options.y+options.height);}
        if (options.border.indexOf("T")>-1) {
          this.doc.line(options.x, options.y, options.x+options.width, options.y);}
        if (options.border.indexOf("B")>-1) {
          this.doc.line(options.x, options.y+options.height, options.x+options.width, options.y+options.height);}}}

    let text_x = options.x + options.padding;
    if ((typeof options.align==="undefined")||(options.align===null)) {
      options.align = "left";}
    if (options.multiline==="false") {
      switch(options.align) {
        case "right":
          text_x = options.x + (options.width -parseFloat(this.doc.getTextWidth(options.text)*this.doc.getFontSize()/this.doc.scaleFactor)-options.padding);
          break;
        case "center":
          text_x = options.x + (options.width -parseFloat(this.doc.getTextWidth(options.text)*this.doc.getFontSize()/this.doc.scaleFactor))/2;
          break;
        default:
          //left
          text_x = options.x + options.padding;}
      this.doc.text(this[_setTextFilter](options.text), text_x,options.y + (0.5*options.height+ 0.3*this.doc.getFontSize()/this.doc.scaleFactor));}
    else if(Array.isArray(options.text)) {
      for (let i=0; i<options.text.length; i++) {
        this.doc.text(this[_setTextFilter](options.text[i]), text_x, options.y+((this.doc.getLineHeight()/this.doc.scaleFactor))*(i+1));}
    } else {
      this.doc.text(this[_setTextFilter](options.text), text_x, 
        options.y + (this.doc.getFontSize()/this.doc.scaleFactor) + options.padding/3,
        { width: options.width-options.padding, align: options.align||"left" });
    }

    if (options.ln>0) {
      options.y = options.y + options.height;
      if (options.ln===1) {options.x = this.template.margins["left-margin"];}}
    else {
      options.x = options.x + options.width;}
    this.template.page.cursor.x = options.x; this.template.page.cursor.y = options.y;

    return true;
  }

  [_createDatagrid](grid_element) {
    let rows = this[_getValue](grid_element.databind,null); if (rows===null) {return true;} 
    rows = this.template.elements.data[rows];if (typeof rows==="undefined") {return true;}
    if (rows.length===0) {return true;}
    
    let grid_options = this[_getElementStyle](grid_element);//font-size,color,border-color
    grid_options.xname = this[_getValue](grid_element.name,"items");
    grid_options.border = this[_getValue](grid_element.border,"1");
    
    let header_options={"font-size":grid_options["font-size"], color:grid_options.color, "border-color":grid_options["border-color"],
        border:grid_options.border, merge:0, "font-style":"bold", text:"", height:0,
        columns: [], columns_width: 0, grid_width: this[_getValue](grid_element.width,"100%")};
    header_options.merge = this[_getValue](grid_element.merge,0);
    header_options["background-color"] = this[_getValue](grid_element["header-background"],null);
    
    let nwidth = this.doc.pageSize.width-this.template.margins["right-margin"]-this.template.margins["left-margin"];
    if (header_options.grid_width.indexOf("%")>-1) {
      header_options.grid_width=nwidth*(parseFloat(header_options.grid_width.replace("%",""))/100);}
    else {header_options.grid_width = parseFloat(header_options.grid_width);
      if (header_options.grid_width>nwidth) {header_options.grid_width=nwidth;}}

    let footer_options={"font-size":grid_options["font-size"], color:grid_options.color, "border-color":grid_options["border-color"],
        border:grid_options.border, "font-style":"bold", text:"", height:0};
    footer_options["background-color"] = this[_getValue](grid_element["footer-background"],null);
    header_options.extend = grid_options.extend = footer_options.extend = (header_options.grid_width===nwidth);
 let footers=[]; let footer_width = 0;
    if (grid_element.columns.length>0) {
      let columns_elements=grid_element.columns;
      for(let index = 0; index < columns_elements.length; index++) {
        let column = columns_elements[index].column;
        if (header_options.columns_width>=header_options.grid_width) {
          return false;}
        let column_options={"font-size":grid_options["font-size"], color:grid_options.color, "border-color":grid_options["border-color"],
            border:grid_options.border};
        column_options.fieldname = this[_getValue](column.fieldname,"");
        column_options.label = this[_setValue](this[_getValue](column.label,""));
        if (header_options.merge===0) {
          column_options.width = this[_getValue](column.width,null);
          if (column_options.width!==null) {
            if (column_options.width.toString().indexOf("%")>-1) {
              column_options.width = header_options.grid_width*(parseFloat(column_options.width.replace("%",""))/100);}
            else {column_options.width = parseFloat(column_options.width);}}
          else {
            column_options.width = parseFloat(
              this.doc.getTextWidth(column_options.label)*this.doc.getFontSize()/this.doc.scaleFactor+this.template.page.padding*2)+1; 
}
          if (header_options.columns_width+column_options.width>=header_options.grid_width) {
            column_options.width = header_options.grid_width-header_options.columns_width;}
          header_options.columns_width += column_options.width;
          let cheight = this[_getHeight](column_options.label,column_options.width,this.template.page.padding,header_options["font-style"]).height;
          if (cheight>header_options.height){header_options.height = cheight;}}
        column_options.header_align = this[_getValue](column["header-align"],"left");
        column_options.align = this[_getValue](column.align,"left");
        if (column_options.align==="left") {
          column_options.multiline = "true";}
        else {column_options.multiline = "false";}

        if ((typeof column.thousands!=="undefined")||(column.digit!=="undefined")||(typeof column.decpoint!=="undefined")) {
          column_options.numbercol = true;
          column_options.thousands = this[_getValue](column.thousands,"");
          column_options.digit = this[_getValue](column.digit,"auto");
          column_options.decpoint = this[_getValue](column.decpoint,".");}
        let footer_value = this[_setValue](this[_getValue](column.footer,""));
        let footer_align = this[_getValue](column["footer-align"],"left");
        if (column_options.numbercol) {
          if (!isNaN(+footer_value) && isFinite(footer_value)) {
            footer_value = this[_setNumberFormat](footer_value, column_options.digit, column_options.decpoint, column_options.thousands);}}
        if (this[_getValue](column.footer,"")!=="") {
          if (footers.length===0) {
            footers.push({text:footer_value, align:footer_align, width:footer_width+column_options.width});}
          else {
            footers[footers.length-1].width += footer_width;
            footers.push({text:footer_value, align:footer_align, width:column_options.width});}
          footer_width = 0;}
        else {footer_width += column_options.width;}
        if (columns_elements.length-1===index) {column_options.ln=1;} else {column_options.ln=0;}
        header_options.columns.push(column_options);}}
    else {return true;}
    if (header_options.merge===0) {this[_createGridHeader](header_options);}

    rows.forEach((row, row_index) => {
      this.template.xml.details += "\n    <"+grid_options.xname.toString()+">";
      grid_options.height = 0; grid_options.text ="";
      header_options.columns.forEach((column) => {
        if (column.fieldname==="counter") {
          column.text = (row_index+1).toString();}
        else {
          if ((typeof row[column.fieldname]!=="undefined") && (row[column.fieldname]!==null)) {column.text = row[column.fieldname];}
          else {column.text = "";}}
        if (column.numbercol) {
          if (!isNaN(+column.text) && isFinite(column.text) && (column.text!=="")) {
            column.text = this[_setNumberFormat](column.text, column.digit, column.decpoint, column.thousands);}}
        if (header_options.merge===0) {
          let cheight = this[_getHeight](column.text,column.width,this.template.page.padding,grid_options["font-style"]).height;
          if (cheight>grid_options.height){grid_options.height = cheight;}}
        else {
          grid_options.text += " "+column.text;
          this.template.xml.details += "\n      <"+column.fieldname.toString()+"><![CDATA["+column.text.toString()+"]]></"+column.fieldname.toString()+">";}}, this);
      if (header_options.merge===0) {
        header_options.columns.forEach((column) => {
          grid_options.text = column.text;
          grid_options.width = column.width;
          grid_options.align = column.align;
          grid_options.ln = column.ln;
          grid_options.multiline = column.multiline;
          this[_createCell](grid_options, header_options);
          this.template.xml.details += "\n      <"+column.fieldname.toString()+"><![CDATA["+column.text.toString()+"]]></"+column.fieldname.toString()+">";}, this);}
      else {
        grid_options.text = grid_options.text.trim();
        grid_options.width = null;
        grid_options.ln = 1;
        grid_options.multiline = "true";
        grid_options.height = null;
        this[_createCell](grid_options);}
      this.template.xml.details += "\n    </"+grid_options.xname.toString()+">";}, this);

    if (header_options.merge===0) {
      footers.forEach((column) => {
        let cheight = this[_getHeight](column.text,column.width,this.template.page.padding,footer_options["font-style"]).height;
        if (cheight>footer_options.height){footer_options.height = cheight;}}, this);
      footers.forEach((column, index) => {
        footer_options.text = column.text;
        footer_options.width = column.width;
        footer_options.align = column.align;
        if (footer_options.align === "left") {
          footer_options.multiline = "true";}
        else {footer_options.multiline = "false";}
        if (footers.length-1===index) {footer_options.ln=1;} else {footer_options.ln=0;}
        this[_createCell](footer_options, header_options);
        this.template.xml.details += "\n    <"+grid_options.xname.toString()+"_footer"+"><![CDATA["+column.text.toString()+
        "]]></"+grid_options.xname.toString()+"_footer"+">";}, this);}
  }

  [_createElements](section, etype, element) {
    let options = {};
    let existing = this[_getValue](element.visible,"");
    if (existing!=="") {
      if (typeof this.template.elements.data[existing]==="undefined") {return "";}
      else {if (this.template.elements.data[existing].length===0) {return "";}}}
    switch(etype) {
      case "row":
        this[_createRow](section,element);
        break;
      case "vgap":
        let height = this[_getValue](element.height,0);
        if (height>0) {
          if (this[_checkPageBreak](this.template.page.cursor.y, height)) {
            this.doc.addPage();}
          else {this.template.page.cursor.y += height;}}
        break;
      case "hline":
        let width = parseFloat(this[_getValue](element.width,0));
        let gap = this[_getValue](element.gap,0);
        if (width===0) {
          width = this.doc.pageSize.width-this.template.margins["left-margin"]-this.template.margins["right-margin"];}
          if (typeof element["border-color"]!=="undefined"){
            options = {"border-color": element["border-color"]};
            this[_setPageStyle](options);}
          this.doc.line(this.template.page.cursor.x, this.template.page.cursor.y,
              this.template.page.cursor.x+width, this.template.page.cursor.y);
          if (gap>0) {
            this.doc.line(this.template.page.cursor.x, this.template.page.cursor.y+gap,
                this.template.page.cursor.x+width, this.template.page.cursor.y+gap);}
          this.template.page.cursor.x = this.template.margins["left-margin"];
          this.template.page.cursor.y += 1+gap;
        break;
      case "html":
        let html = element.html; let fieldname = this[_getValue](element.fieldname,"head");
        options = this[_getElementStyle](element); this[_setPageStyle](options); this.doc.text("", 0, 0);
        html = this[_setTextFilter](this[_setHtmlValue](html,fieldname));
        this.doc.fromHTML(html, this.template.page.cursor.x, this.template.page.cursor.y,
            {'width': this.doc.pageSize.width-this.template.margins["left-margin"]-this.template.margins["right-margin"],
              'elementHandlers':function(){}}, (dispose) => this[_setHtmlCursor](dispose), 
            {top: this.template.margins["top-margin"]+this.template.page.header_height,
              bottom: this.template.margins["bottom-margin"]+this.template.page.footer_height});
        break;
      case "datagrid":
        this[_createDatagrid](element);
        break;}
    return true;
  }

  [_createFooter]() {
    let efooter = this.template.elements.footer;
    for(let i = 0; i < efooter.length; i++) {
      let etype = this[_getElementType](efooter[i]);
      switch(etype) {
        case "row":
        case "vgap":
        case "hline":
          this[_createElements]("footer", etype, efooter[i][etype]);
          break;}}
  }

  [_createGridHeader](header_options) {
    header_options.height=0;header_options.x=null;header_options.y=null;
    header_options.columns.forEach((column) => {
      if (header_options.merge===0) {
        header_options.text = column.label;
        header_options.ln = column.ln;
        if (column.width===0) {
          column.width = (header_options.grid_width-header_options.columns_width)/header_options.columns.length;}
        header_options.width = column.width;
      } else {header_options.text += " "+column.label;}
      header_options.align = column.header_align;
      if (header_options.align === "left") {
        header_options.multiline = "true";}
      else {header_options.multiline = "false";}
      this[_createCell](header_options, header_options);
      if (header_options.width>column.width) {column.width = header_options.width;}}, this);
  }

  [_createHeader]() {
    let eheader = this.template.elements.header;
    for(let i = 0; i < eheader.length; i++) {
      let etype = this[_getElementType](eheader[i]);
      switch(etype) {
        case "row":
        case "vgap":
        case "hline":
          this[_createElements]("header", etype, eheader[i][etype]);
          break;}}
  }

  [_createRow](section, row_element) {
    let hgap = this[_getValue](row_element.hgap,0);
    let row_height = this[_getValue](row_element.height,null); let max_height = row_height;
    
    for(let index = 0; index < row_element.columns.length; index++) {
      if (this.template.page.cursor.x!==this.template.margins["left-margin"]) {
        this.template.page.cursor.x+=parseFloat(hgap);}
      let rtype = this[_getElementType](row_element.columns[index]);
      let element = row_element.columns[index][rtype];
      switch(rtype) {
        case "cell":
          let options = {height:row_height};
          options = this[_getElementStyle](element,options);
          options.text = this[_setValue](this[_getValue](element.value,""));
          options.width = this[_getValue](element.width,null);
          options.border = this[_getValue](element.border,null);
          options.align = this[_getValue](element.align,"left");
          if (row_element.columns.length-1===index) {options.ln=1;} else {options.ln=0;}
          options.multiline = "false"; options.extend = true;
          if (section==="details") {
            options.multiline = this[_getValue](element.multiline,"false");}
          this[_createCell](options);
          if (options.height>max_height || max_height===null) {max_height = options.height;}

          let xname = this[_getValue](element.name,"head");
          if (section==="header" && xname!=="label") {
            this.template.xml.header += "\n    <"+xname.toString()+"><![CDATA["+options.text.toString()+"]]></"+xname.toString()+">";}
          if (section==="details" && xname!=="label") {
            this.template.xml.details += "\n    <"+xname.toString()+"><![CDATA["+options.text.toString()+"]]></"+xname.toString()+">";}
          break;
        case "image":
          let img_src = this[_getValue](element.src,null);
          if (img_src !== null) {
            if (img_src.toString().substr(0,10)!=="data:image") {
              img_src = this[_setValue](img_src);}
            if (img_src.toString().substr(0,10)==="data:image") {
              let width = parseFloat(this[_getValue](element.width, row_height-1));
              let img_height = this[_getValue](element.height, row_height-1);
              let compression = this[_getValue](element.compression,"medium");
              if (this[_checkPageBreak](this.template.page.cursor.y, img_height)) {
                this.doc.addPage();}
              this.doc.addImage(img_src, this.template.page.cursor.x, this.template.page.cursor.y+1.5, 
                {width: width, height: img_height, alias: null, compression: compression});
              this.template.page.cursor.x += width;
              if (max_height<img_height || max_height===null) {max_height = img_height;}}}
          break;
        case "barcode":
          let color = this[_getValue](element.color, this.template.style.color);
          this.doc.setFillColor(color);
          let code_type = this[_getValue](element["code-type"],"CODE_39");
          let code = this[_getValue](element.value,"");
          let visible = this[_getValue](element["visible-value"],0);
          let wide = this[_getValue](element.wide,this[_getDefBarcodeSize](code_type, "wide"));
          let narrow = this[_getValue](element.wide,this[_getDefBarcodeSize](code_type, "narrow"));
          let bc_height = narrow;
          if (visible===1) {
            bc_height = narrow +(this.doc.getFontSize()/this.doc.scaleFactor);}
          if (this[_checkPageBreak](this.template.page.cursor.y, bc_height)) {
            this.doc.addPage();}
          switch (code_type) {
            case "CODE_39":
            case "code39":
              this[_barCode39](code, wide, narrow, visible);
              break;
            case "ITF":
            case "i2of5":
              this[_barInterleaved2of5](code, wide, narrow, visible);
              break;}
          if (max_height<bc_height || max_height===null) {max_height = bc_height;}
          break;
        case "separator":
          if (max_height!==null) {
            let gap = this[_getValue](element.gap,0);
            this.doc.line(this.template.page.cursor.x+gap, this.template.page.cursor.y,
                this.template.page.cursor.x+gap, this.template.page.cursor.y+parseFloat(max_height));
            if (row_element.columns.length-1<index) {this.template.page.cursor.x += gap;}}
          break;}
      if (rtype!=="cell") {
        if (row_element.columns.length-1===index) {
          this.template.page.cursor.y+=max_height;
          this.template.page.cursor.x = this.template.margins["left-margin"];}}}
  }

  [_createXmlElement](obj, xdoc, parent) {
    for(let i = 0; i < obj.length; i++) {
      let etype = this[_getElementType](obj[i]);
      let element = parent.appendChild(xdoc.createElement(etype));
      for(let ai = 0; ai < Object.keys(obj[i][etype]).length; ai++) {
        let pname = Object.keys(obj[i][etype])[ai];
        let pval = obj[i][etype][pname];
        if (typeof pval === "object") {
          if (Array.isArray(pval)) {
            let columns = element.appendChild(xdoc.createElement(pname));
            this[_createXmlElement](pval, xdoc, columns);
          } else {element.setAttribute(pname, pval);}} 
        else {
          if (pname==="html") {element.appendChild(xdoc.createCDATASection(pval));}
          else {element.setAttribute(pname, pval);}}}}
  }

  [_getDefBarcodeSize](code_type, size_type) {
    switch (code_type) {
      case "CODE_39":
      case "code39":
        if (size_type==="wide")
          return 1.5*this.mm_pt;
        else return 5*this.mm_pt;
      case "ITF":
      case "i2of5":
        if (size_type==="wide")
          return 1*this.mm_pt;
        else return 10*this.mm_pt;}
    return 0;
  }

  [_getElementType](element) {
    if (Object.getOwnPropertyNames(element).length > 0) {
      return Object.getOwnPropertyNames(element)[0];
    } else {return null;}
  }

  [_getElementStyle](element, options){
    if ((typeof options==="undefined")||(options===null)) {
      options = {};}
    options["font-family"] = this[_getValue](element["font-family"],null);
    options["font-style"] = this[_getValue](element["font-style"],null);
    options["font-size"] = this[_getValue](element["font-size"],null);
    
    options.color = this[_getValue](element.color,null);
    options["border-color"] = this[_getValue](element["border-color"],null);
    options["background-color"] = this[_getValue](element["background-color"],null);
    return options;
  }

  [_getFooterHeight]() {
    let footer_height = 0;
    let efooter = this.template.elements.footer;
    for(let i = 0; i < efooter.length; i++) {
      let itype = this[_getElementType](efooter[i]);
      let foo_item = efooter[i][itype];
      switch(itype) {
        case "row":
          let row_height = this[_getValue](foo_item.height,0);
          for(let index = 0; index < Object.keys(foo_item.columns).length; index++) {
            let etype = this[_getElementType](foo_item.columns[index]);
            let element = foo_item.columns[index][etype];
            switch(etype) {
              case "cell":
                let cell_height = this[_getValue](element.height,null);
                if (cell_height===null) {
                  cell_height = parseFloat(this.doc.getLineHeight()/this.doc.scaleFactor)+(this.template.page.padding);}
                else {cell_height = parseFloat(cell_height);}
                if (cell_height>row_height){row_height=cell_height;}
                break;
              case "barcode":
                let code_type = this[_getValue](element["code-type"],"CODE_39");
                let visible = this[_getValue](element["visible-value"],0);
                let narrow = this[_getValue](element.wide, this[_getDefBarcodeSize](code_type, "narrow"));
                if (visible===1) {
                  narrow += (this.doc.getFontSize()/this.doc.scaleFactor);}
                if (narrow>row_height){row_height=narrow;}
                break;
              case "image":
                let img_src = this[_getValue](element.src,null);
                if (img_src !== null) {
                  if (img_src.toString().substr(0,10)!=="data:image") {
                    img_src = this[_setValue](img_src);}
                  if (img_src.toString().substr(0,10)==="data:image") {
                    let img_height = this[_getValue](element.height,0);
                    if (img_height===0) {img_height = row_height-1;}
                    if (img_height>row_height) {row_height = img_height;}}}
                break;}}
          footer_height += row_height;
          break;
        case "vgap":
          footer_height += this[_getValue](foo_item.height,0);
          break;
        case "hline":
          footer_height += 1 + this[_getValue](foo_item.gap,0);
          break;}}
    return footer_height;
  }

  [_getHeight](text,width,padding,fonttype) {
    fonttype = (fonttype === null) ? "normal" : fonttype;
    this.doc.setFontType(fonttype);
    let stext = this.doc.splitTextToSize(text, width-2*padding);
    if(Array.isArray(stext))
      return {text:stext, height:((this.doc.getLineHeight()/this.doc.scaleFactor))*(stext.length)+padding}
    else 
      return { text: text, height: stext+1.2*padding }
  }

  [_getParent](element) {
    let parent = this[_getParentSection](element, this.template.elements.details);
    if (parent === null) {
      parent = this[_getParentSection](element, this.template.elements.header);}
    if (parent === null) {
      parent = this[_getParentSection](element, this.template.elements.footer);}
    return parent;
  }

  [_getParentSection](element, section) {
    for(let i = 0; i < section.length; i++) {
      if (element === section[i]) {return section;}
      else {
        let etype = this[_getElementType](section[i]);
        if (etype==="row" || etype==="datagrid") {
          for(let ri = 0; ri < section[i][etype].columns.length; ri++) {
            if (element === section[i][etype].columns[ri]) {return section[i][etype].columns;}
          }}}}
    return null;
  }

  [_getValue](value, defvalue) {
    if ((typeof value!=="undefined")&&(value!==null)) {
      return value;} else {return defvalue;}
  }
  
  [_parseJson](section, obj) {
    for(let hi = 0; hi < obj.length; hi++) {
      let otype = this[_getElementType](obj[hi]);
      switch(otype) {
        case "row":
          let hrow = obj[hi][otype]; let rprop ={}; rprop[otype] = {columns:[]};
          this[_setProperties](hrow, rprop[otype]);
          for(let ri = 0; ri < hrow.columns.length; ri++) {
            let ctype = this[_getElementType](hrow.columns[ri]);
            let cprop = {}; cprop[ctype] = {};
            this[_setProperties](hrow.columns[ri][ctype], cprop[ctype]);
            rprop[otype].columns.push(cprop);}
          this.template.elements[section].push(rprop);
          break;
        case "datagrid":
          let grow = obj[hi][otype]; let gprop ={}; gprop[otype] = {columns:[]};
          this[_setProperties](grow, gprop[otype]);
          for(let ci = 0; ci < grow.columns.length; ci++) {
            let column = grow.columns[ci].column;
            let cgprop = {}; cgprop.column = {};
            this[_setProperties](column, cgprop.column);
            gprop.datagrid.columns.push(cgprop);}
          this.template.elements[section].push(gprop);
          break;
        case "html":
          let html = {}; html[otype] = {};
          this[_setProperties](obj[hi][otype], html[otype]);
          html[otype].html = obj[hi][otype].html;
          this.template.elements[section].push(html);
          break;
        case "vgap":
        case "hline":
          let hprop = {}; hprop[otype] = {};
          this[_setProperties](obj[hi][otype], hprop[otype]);
          this.template.elements[section].push(hprop);
          break;}}
  }

  [_parseReport]() {
    this.template.document.author = this.template.elements.report.author||this.template.document.author;
    this.template.document.creator = this.template.elements.report.creator||this.template.document.creator;
    this.template.document.subject = this.template.elements.report.subject||this.template.document.subject;
    this.template.document.title = this.template.elements.report.title||this.template.document.title;

    if (typeof this.template.elements.report["font-family"]!=="undefined"){
      this.template.style["font-family"] = this.template.elements.report["font-family"];}
    if (typeof this.template.elements.report["font-style"]!=="undefined"){
      this.template.style["font-style"] = this.template.elements.report["font-style"];}
    if (typeof this.template.elements.report["font-size"]!=="undefined"){
      this.template.style["font-size"] = this.template.elements.report["font-size"];}

    if (typeof this.template.elements.report.color!=="undefined"){
      this.template.style.color = this.template.elements.report.color;}
    if (typeof this.template.elements.report["border-color"]!=="undefined"){
      this.template.style["border-color"] = this.template.elements.report["border-color"];}
    if (typeof this.template.elements.report["background-color"]!=="undefined"){
      this.template.style["background-color"] = this.template.elements.report["background-color"];}

    this.template.margins["left-margin"] = this.template.elements.report["left-margin"]||this.template.margins["left-margin"];
    this.template.margins["right-margin"] = this.template.elements.report["right-margin"]||this.template.margins["right-margin"];
    this.template.margins["top-margin"] = this.template.elements.report["top-margin"]||this.template.margins["top-margin"];
    this.template.margins["bottom-margin"] = this.template.elements.report["bottom-margin"]||this.template.margins["bottom-margin"];
  }

  [_parseValue](vname, value) {
    switch(vname) {
      
      case "format":
        value = this[_getValue](value,"a4");
        switch (value) {
          case "a3":
          case "a4":
          case "a5":
          case "letter":
          case "legal":
            break;
          default:
            value = "a4";}
        return value;
      
      case "orientation":
        value = this[_getValue](value,"p");
        switch (value) {
          case "p":
          case "portrait":
          case "l":
          case "landscape":
            break;
          default:
            value = "p";}
        return value;
      
      case "unit":
        value = this[_getValue](value, this.defUnit);
        switch (value) {
          case "pt":
          case "mm":
          //case "cm":
          //case "in":
            break;
          default:
            value = this.defUnit;}
        return value;
        
      case "author":
      case "creator":
      case "subject":
      case "title":
        value = this[_getValue](value, this.template.document[vname]);
        return value;
      
      //integer
      case "font-size":
      case "digit":
        value = value.toString().replace(/[^0-9\-]|\-(?=.)/g,'');
        value = parseInt(this[_getValue](value,null),10);
        if (!isNaN(value)) {
          return parseInt(this[_getValue](value,null),10);}
        return null;
      
      //float
      case "left-margin":
      case "right-margin":
      case "top-margin":
      case "bottom-margin":
      case "height":
      case "gap":
      case "hgap":
      case "wide":
      case "narrow":
        value = value.toString().replace(/[^0-9\-\.,]|[\-](?=.)|[\.,](?=[0-9]*[\.,])/g,'');
        value = parseFloat(this[_getValue](value,null));
        if (!isNaN(value)) {
          if(this.unit === "mm")
            value = value*this.mm_pt;
          return parseFloat(this[_getValue](value,null));}
        return null;
      
      //percent or float
      case "width":
        value = value.toString().replace(/[^0-9\-\.,%]|[\-](?=.)|[\.,%](?=[0-9]*[\.,%])/g,'');
        if (value==="") {
          value = null;}
        else if (value.indexOf("%")>-1) {
          let pv = parseInt(value.replace("%",""),10);
          if (pv>100) {pv=100;}
          value = pv.toString()+"%";}
        else {
          value = parseFloat(value);
          if(this.unit === "mm")
            value = value*this.mm_pt;}
        return value;
      
      //string
      case "src":
      case "value":
      case "name":
      case "databind":
      case "label":
      case "fieldname":
      case "thousands":
      case "footer":
      case "decpoint":
      case "visible":
      case "border":
      case "html":
      case "code-type":
        return value;
        
      case "merge":
      case "visible-value":
        value = parseInt(this[_getValue](value,0),10);
        if (value===0 || value==="") {
          return 0;} 
        return 1;
      
      case "multiline":
        value = this[_getValue](value,"false");
        if (value==="false" || value==="") {
          return "false";} 
        return "true";
      
      case "compression":
        value = this[_getValue](value,"medium");
        switch (value) {
          case "fast":
          case "medium":
          case "slow":
            break;
          default:
            value = "medium";}
        return value;
        
      case "align":
      case "header-align":
      case "footer-align":
        value = this[_getValue](value,"left");
        switch(value) {
          case "R":
            return "right";
          case "C":
            return "center";
          case "left":
          case "center":
          case "right":
          case "justify":
            return value;
          default:
            return "left";}
        
      //check fonts
      case "font-family":
        value = this[_getValue](value,null);
        //if (value!=="times" && value!=="helvetica" && value!=="courier") {
        //  value = "times";}
        return value;
        
      //check font-style
      case "font-style":
        value = this[_getValue](value,null);
        if (value!==null) {
          switch(value) {
            case "B":
              value = "bold";
              break;
            case "I":
              value = "italic";
              break;
            case "BI":
            case "IB":
              value = "bolditalic";
              break;
            case "bold":
            case "italic":
            case "bolditalic":
            case "normal":
              break;
            default:
              value = "normal";}
          return value;}
        return null;
      
      //hex.color
      case "color":
        value = this[_getValue](value,null);
        if (value!==null) {
          if (value.toString().charAt(0)!=="#") {
            if(!isNaN(parseInt(value,10))) {
              value = "#"+parseInt(value,10).toString(16).toUpperCase();
              return value;
            } else {return null;}
          } else {return value;}}
        return null;
        
      //rgb color
      case "border-color":
      case "background-color":
      case "footer-background":
      case "header-background":
        value = this[_getValue](value,null);
        if (value!==null) {
          if (value.toString().charAt(0)==="#") {
            value = this[_setHex2greyscale](value); return value;}
          else {
            if(!isNaN(parseInt(value,10))) {
              if (parseInt(value,10)>255) {
                value = this[_setHex2greyscale](parseInt(value,10).toString(16).toUpperCase());} 
              return parseInt(value,10);} 
            else {return null;}}}
        return null;}
    return null;
  }
  
  [_parseXml](section, xml) {
    for(let hi = 0; hi < xml.childNodes.length; hi++) {
      switch(xml.childNodes[hi].nodeName) {
        case "row":
          let hrow = xml.childNodes[hi]; let rprop ={}; rprop[xml.childNodes[hi].nodeName] = {columns:[]};
          this[_setAttributes](hrow, rprop[xml.childNodes[hi].nodeName]);
          let cells = hrow.childNodes;
          for(let rci = 0; rci < cells.length; rci++) {
            if (cells[rci].nodeName!=="#text") {cells = cells[rci];}}
          for(let ri = 0; ri < cells.childNodes.length; ri++) {
            switch(cells.childNodes[ri].nodeName) {
              case "cell":
              case "image":
              case "barcode":
              case "separator":
                let cprop = {}; cprop[cells.childNodes[ri].nodeName] = {};
                this[_setAttributes](cells.childNodes[ri], cprop[cells.childNodes[ri].nodeName]);
                rprop[xml.childNodes[hi].nodeName].columns.push(cprop);
                break;}}
          this.template.elements[section].push(rprop);
          break;
        case "datagrid":
          let grow = xml.childNodes[hi]; let gprop ={}; gprop[xml.childNodes[hi].nodeName] = {columns:[]};
          this[_setAttributes](grow, gprop[xml.childNodes[hi].nodeName]);
          for(let gi = 0; gi < grow.childNodes.length; gi++) {
            switch(grow.childNodes[gi].nodeName) {
              case "header":
              case "footer":
                let value = this[_parseValue]("background-color", grow.childNodes[gi].attributes["background-color"].value);
                if (value!==null) {
                  gprop[xml.childNodes[hi].nodeName][grow.childNodes[gi].nodeName+"_background"] = value;}
                break;
              case "columns":
                let columns = grow.childNodes[gi];
                for(let ci = 0; ci < columns.childNodes.length; ci++) {
                  if(columns.childNodes[ci].nodeName==="column") {
                    let cgprop = {}; cgprop[columns.childNodes[ci].nodeName] = {};
                  this[_setAttributes](columns.childNodes[ci], cgprop[columns.childNodes[ci].nodeName]);
                  gprop[xml.childNodes[hi].nodeName].columns.push(cgprop);}}
                break;}}
          this.template.elements[section].push(gprop);
          break;
        case "html":
          let html = {}; html[xml.childNodes[hi].nodeName] = {};
          this[_setAttributes](xml.childNodes[hi], html[xml.childNodes[hi].nodeName]);
          html[xml.childNodes[hi].nodeName].html = xml.childNodes[hi].textContent || "";
          this.template.elements[section].push(html);
          break;
        case "vgap":
        case "hline":
          let hprop = {}; hprop[xml.childNodes[hi].nodeName] = {};
          this[_setAttributes](xml.childNodes[hi], hprop[xml.childNodes[hi].nodeName]);
          this.template.elements[section].push(hprop);
          break;}}
  }

  [_setAttributes](from, to) {
    for(let i = 0; i < from.attributes.length; i++) {
      let value = this[_parseValue](from.attributes[i].name, from.attributes[i].value);
      if (value!==null) {
        to[from.attributes[i].name] = value;}}
  }

  [_setHex2greyscale](hex) {
    if (hex.charAt(0)==="#") {hex = hex.substring(1,7);}
    return (parseInt(hex.substring(0,2),16)+parseInt(hex.substring(2,4),16)+parseInt(hex.substring(4,6),16))/3;
  }

  [_setHtmlCursor](dispose) {
    this.template.page.cursor.x = this.template.margins["left-margin"];
    this.template.page.cursor.y = dispose.y;
    return true;
  }

  [_setHtmlValue](html,fieldname) {
    if (html.indexOf("={{")>-1 && html.indexOf("}}")>-1) {
      let _value = html.substring(html.indexOf("={{"), html.indexOf("}}")+2);
      let value_ = this[_setValue](_value);
      html = html.replace(_value,value_).replace(/<br\s*[\/]?>/gi, "<p>");
      this.template.xml.details += "\n    <"+fieldname.toString()+"><![CDATA["+value_.toString()+"]]></"+fieldname.toString()+">";
      if (html.indexOf("={{")>-1 && html.indexOf("}}")>-1) {
        html = this[_setHtmlValue](html,fieldname);
      } else {return html;}
    } else {return html;}
  }

  [_setPageStyle](options){
    //font-family, font-size, font-style, color,background-color,border-color
    this.doc.setFont(this.template.style["font-family"]);
    if ((typeof options["font-family"] !== "undefined") && (options["font-family"] !== null)) {
      this.doc.setFont(options["font-family"]);}
    this.doc.setFontType(this.template.style["font-style"]);
    if ((typeof options["font-style"] !== "undefined") && (options["font-style"] !== null)) {
      this.doc.setFontType(options["font-style"]);}
    this.doc.setFontSize(this.template.style["font-size"]);
    if ((typeof options["font-size"] !== "undefined") && (options["font-size"] !== null)) {
      this.doc.setFontSize(options["font-size"]);}
    
    if ((typeof options.color === "undefined") || (options.color === null)) {
      options.color = this.template.style.color;}
    this.doc.setTextColor(options.color);
    if ((typeof options["background-color"] === "undefined")||(options["background-color"] === null)) {
      options["background-color"] = this.template.style["background-color"];}
    this.doc.setFillColor(options["background-color"]);
    if ((typeof options["border-color"] === "undefined") || (options["border-color"] === null)) {
      options["border-color"] = this.template.style["border-color"];}
    this.doc.setDrawColor(options["border-color"]);
  }
  
  [_setProperties](from, to) {
    for(let i = 0; i < Object.keys(from).length; i++) {
      let pname = Object.keys(from)[i];
      let value = this[_parseValue](pname, from[pname]);
      if (value!==null) {
        to[pname] = value;}}
  }

  [_setTextFilter](text) {
    this.textFilter.forEach(filter => {
      if(Array.isArray(filter)){
        if(filter.length >= 2)
          text = text.replace(new RegExp(String(filter[0]), "g"), String(filter[1]));
      }
    });
    return text;
  }

  [_setNumberFormat](number, decimals, dec_point, thousands_sep) {
    let digit = decimals;
    if(decimals === "auto"){
      if(number.toString().indexOf(dec_point)>-1){
        digit = number.toString().substr(number.indexOf(dec_point)+1).length;}
      else {
        digit = 0;}}
    let n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+digit) ? 0 : Math.abs(digit),
      sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
      dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
      toFixedFix = function (n, prec) {
        let k = Math.pow(10, prec);
        return Math.round(n * k) / k;},
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);}
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');}
    return s.join(dec);
  }

  [_setValue](value) {
    const getValue = (value) => {
      if (value.indexOf("{{page}}")>-1) {value = value.replace("{{page}}", this.template.page.current_page.toString());}
      let dbv = value.split(".");
      if (typeof this.template.elements.data[dbv[0]]!=="undefined") {
        if (typeof this.template.elements.data[dbv[0]]==="object") {
          if (Array.isArray(this.template.elements.data[dbv[0]])) {
            try {
              if (this.template.elements.data[dbv[0]][parseInt(dbv[1],10)][dbv[2]]!==null) {
                return this.template.elements.data[dbv[0]][parseInt(dbv[1],10)][dbv[2]].toString();}
              else {return "";}}
            catch(err) {return value;}}
          else {
            try {
              if (this.template.elements.data[dbv[0]][dbv[1]]!==null) {
                return this.template.elements.data[dbv[0]][dbv[1]].toString();}
              else {return "";}}
            catch(err) {return value;}}}
        else {
          if (this.template.elements.data[dbv[0]]!==null) {
            return this.template.elements.data[dbv[0]].toString();}
          else {return "";}}}
      else {return value;}};

    if (value.indexOf("={{")>-1 && value.indexOf("}}")>-1) {
      let _value = value.substring(value.indexOf("={{")+3, value.indexOf("}}"));
      value = value.replace("={{"+_value+"}}",getValue(_value));
      if (value.indexOf("={{")>-1 && value.indexOf("}}")>-1) {
        return this[_setValue](value);} else {return value;}
    } else {
      return getValue(value);}
  }

  //public
  createReport() {
    this.doc.setProperties({
      author: this.template.document.author, creator: this.template.document.creator,
      subject: this.template.document.subject, title: this.template.document.title});
    if (this.template.elements.details.length>0) {
      this.template.page.cursor = {
        x: this.template.margins["left-margin"], 
        y: this.template.margins["top-margin"]};
      this[_setPageStyle]({}); let footer_height = this[_getFooterHeight]();
      this.template.page.cursor.y = this.doc.pageSize.height-this.template.margins["bottom-margin"]-footer_height;
      this[_createFooter]();
      this.template.page.cursor.y = this.template.margins["top-margin"]; this.template.page.footer_height = footer_height;
      this.template.page.cursor.x = this.template.margins["left-margin"];
      this[_createHeader](); 
      this.template.page.header_height = this.template.page.cursor.y - this.template.margins["top-margin"];
      let edetails = this.template.elements.details;
        for(let i = 0; i < edetails.length; i++) {
          let etype = this[_getElementType](edetails[i]);
          this[_createElements]("details", etype, edetails[i][etype]);}}
    return true;
  }

  deleteElement(element, parent) {
    if ((typeof parent==="undefined")||(parent===null)) {
      parent = this[_getParent](element);}
    if (parent!==null) {
      if (!Array.isArray(parent)) {
        let ptype = this[_getElementType](parent);
        if (ptype==="row" || ptype==="datagrid") {parent = parent[ptype].columns;}
        else {return false;}}}
    if (parent!==null) {
      let index = parent.indexOf(element);
      if (index > -1) {parent.splice(index, 1);}
      return true;}
    return false;
  }

  editElement(element, values) {
    let ptype = this[_getElementType](element);
    if (ptype!==null) {
      for(let i = 0; i < Object.keys(values).length; i++) {
        let pname = Object.keys(values)[i];
        if (element[ptype].hasOwnProperty(pname) && values[pname]===null) {
          delete element[ptype][pname];
        } else {
          element[ptype][pname] = values[pname];}}
      return true;
    } else {return false;}
  }

  getData(key) {
    return this.template.elements.data[key];
  }

  getXmlTemplate(parser, serializer) {
    let xml_str = "<template><report/><header></header><details></details><footer></footer><data></data></template>";
    let xml_elements = parser.parseFromString(xml_str, "application/xml");
    
    for(let i = 0; i < Object.keys(this.template.elements.report).length; i++) {
      let pname = Object.keys(this.template.elements.report)[i];
      xml_elements.getElementsByTagName("report")[0].setAttribute(pname, this.template.elements.report[pname]);}
    this[_createXmlElement](this.template.elements.header, xml_elements, xml_elements.getElementsByTagName("header")[0]);
    this[_createXmlElement](this.template.elements.details, xml_elements, xml_elements.getElementsByTagName("details")[0]);
    this[_createXmlElement](this.template.elements.footer, xml_elements, xml_elements.getElementsByTagName("footer")[0]);
    
    for(let i = 0; i < Object.keys(this.template.elements.data).length; i++) {
      let ename = Object.keys(this.template.elements.data)[i];
      let element = xml_elements.getElementsByTagName("data")[0].appendChild(
        xml_elements.createElement(ename));
      if (typeof this.template.elements.data[ename] === "object") {
        if (!Array.isArray(this.template.elements.data[ename])) {
          for(let pi = 0; pi < Object.keys(this.template.elements.data[ename]).length; pi++) {
            let pname = Object.keys(this.template.elements.data[ename])[pi];
            element.setAttribute(pname, this.template.elements.data[ename][pname]);}
        } else {
          for(let ai = 0; ai < this.template.elements.data[ename].length; ai++) {
            let erow = element.appendChild(xml_elements.createElement(ename));
            for(let pai = 0; pai < Object.keys(this.template.elements.data[ename][ai]).length; pai++) {
              let epname = Object.keys(this.template.elements.data[ename][ai])[pai];
              erow.setAttribute(epname, this.template.elements.data[ename][ai][epname]);}}}}
      else {
        element.appendChild(xml_elements.createCDATASection(this.template.elements.data[ename]));}}
    
    return serializer.serializeToString(xml_elements);
  }

  insertElement(parent, ename, index, values) {
    if ((typeof parent==="undefined")||(parent===null)) {parent=this.template.elements.details;}
    if ((typeof ename==="undefined")||(ename===null)) {ename="row";}
    if ((typeof index==="undefined")||(index===null)) {index=-1;}
    if ((typeof values==="undefined")||(values===null)) {values={};}
    if (typeof parent === "object") {
      if (!Array.isArray(parent)) {
        let ptype = this[_getElementType](parent);
        if (ptype==="row" || ptype==="datagrid") {parent = parent[ptype].columns;}
      }} else {return null;}
    let element = {}; element[ename] = {};
    switch (ename) {
      case "row":
      case "datagrid":
        element[ename].columns=[];
        break;
      case "vgap":
      case "hline":
      case "html":
      case "column":
      case "cell":
      case "image":
      case "barcode":
      case "separator":
        break;
      default:
        return null;}
    if (index>parent.length || index<0) {index=parent.length;}
    parent.splice(index, 0, element);
    for(let i = 0; i < Object.keys(values).length; i++) {
      let pname = Object.keys(values)[i];
      element[ename][pname] = this[_parseValue](pname,values[pname]);}
    return element;
  }

  pageAdded(pageNumber) {
    this.template.page.current_page = pageNumber;
    let footer_height = this.template.page.footer_height; this.template.page.footer_height = 0;
    this.template.page.cursor.y = this.doc.pageSize.height-this.template.margins["bottom-margin"]-footer_height;
    this[_createFooter](); this.template.page.cursor.y = this.template.margins["top-margin"]; this.template.page.footer_height = footer_height;
    this[_createHeader](); this.template.page.cursor.x = this.template.margins["left-margin"];
    this.template.page.cursor.y = this.template.margins["top-margin"] + this.template.page.header_height;
  }

  loadDefinition(data, parser) {
    if ((data!==null) && (data!=="") && (typeof data==="string")) {
      this.template.elements = {report: {}, header: [], details: [], footer: [], data: {}};
      this.template.element_matrix = [];
      let xml_elements = parser.parseFromString(data, "application/xml");
      
      if (xml_elements.getElementsByTagName("report").length>0) {
        this[_setAttributes](xml_elements.getElementsByTagName("report")[0], this.template.elements.report);}
          
      if (xml_elements.getElementsByTagName("header").length>0) {
        this[_parseXml]("header", xml_elements.getElementsByTagName("header")[0]);}
      if (xml_elements.getElementsByTagName("details").length>0) {
        this[_parseXml]("details", xml_elements.getElementsByTagName("details")[0]);}
      if (xml_elements.getElementsByTagName("footer").length>0) {
        this[_parseXml]("footer", xml_elements.getElementsByTagName("footer")[0]);}
      if (xml_elements.getElementsByTagName("data").length>0) {
        let db = this.template.elements.data;
        let xdata = xml_elements.getElementsByTagName("data")[0];
        for(let i = 0; i < xdata.childNodes.length; i++) {
          if (xdata.childNodes[i].nodeName!=="#text") {
            if (xdata.childNodes[i].childNodes.length>0) {
              if (xdata.childNodes[i].childNodes.length===1 && xdata.childNodes[i].childNodes[0].nodeName==="#text") {
                db[xdata.childNodes[i].nodeName] = xdata.childNodes[i].childNodes[0].textContent;
              } else {
                if (xdata.childNodes[i].childNodes.length===1 && 
                  xdata.childNodes[i].childNodes[0].nodeName==="#cdata-section") {
                  db[xdata.childNodes[i].nodeName] = xdata.childNodes[i].childNodes[0].data;
                } else {
                  db[xdata.childNodes[i].nodeName] = [];
                  for(let ci = 0; ci < xdata.childNodes[i].childNodes.length; ci++) {
                    if (xdata.childNodes[i].childNodes[ci].nodeName!=="#text") {
                      let xelement = xdata.childNodes[i].childNodes[ci]; let xobj = {};
                    for(let cai = 0; cai < xelement.attributes.length; cai++) {
                      xobj[xelement.attributes[cai].nodeName] = xelement.attributes[cai].value;}
                    db[xdata.childNodes[i].nodeName].push(xobj);}}}}
            } else {
              if (xdata.childNodes[i].attributes.length>0) {
                db[xdata.childNodes[i].nodeName] = {};
                for(let ai = 0; ai < xdata.childNodes[i].attributes.length; ai++) {
                  db[xdata.childNodes[i].nodeName][xdata.childNodes[i].attributes[ai].name] = xdata.childNodes[i].attributes[ai].value;}} 
              else {
                this.template.elements.data[xdata.childNodes[i].nodeName] = xdata.childNodes[i].textContent;}}}}
        this.orig_data = this.template.elements.data;}
      this[_parseReport](); return true;}
    return false;
  }

  loadJsonDefinition(data) {
    if ((data===null) || (data==="") || (typeof data==="undefined")) {return true;}
    if (typeof data==="string") {
      data = JSON.parse(data);}
    this.template.elements = {report: {}, header: [], details: [], footer: [], data: {}};
    this.template.element_matrix = [];
    if (typeof data.report !== "undefined") {
      this[_setProperties](data.report, this.template.elements.report);}
    if (typeof data.header !== "undefined") {
        this[_parseJson]("header", data.header);}
    if (typeof data.details !== "undefined") {
        this[_parseJson]("details", data.details);}
    if (typeof data.footer !== "undefined") {
        this[_parseJson]("footer", data.footer);}
    if (typeof data.data !== "undefined") {
      let db = this.template.elements.data;
      for(let i = 0; i < Object.keys(data.data).length; i++) {
        let pname = Object.keys(data.data)[i];
        if (typeof data.data[pname] === "object") {
          if (!Array.isArray(data.data[pname])) {
            db[pname] = {};
            for(let pi = 0; pi < Object.keys(data.data[pname]).length; pi++) {
              db[pname][Object.keys(data.data[pname])[pi]] = data.data[pname][Object.keys(data.data[pname])[pi]];}
          } else {
            db[pname] = [];
            for(let ai = 0; ai < data.data[pname].length; ai++) {
              let element = {};
              for(let pai = 0; pai < Object.keys(data.data[pname][ai]).length; pai++) {
                element[Object.keys(data.data[pname][ai])[pai]] = data.data[pname][ai][Object.keys(data.data[pname][ai])[pai]];}
              db[pname].push(element);}}}
        else {
          db[pname] = data.data[pname];}}}
    this[_parseReport](); return true;
  }

  setData(key, value) {
    if ((typeof value === "object") && (typeof this.template.elements.data[key] === "object")){
      if (!Array.isArray(value) && !Array.isArray(this.template.elements.data[key])) {
        for(let pi = 0; pi < Object.keys(value).length; pi++) {
          let pname = Object.keys(value)[pi];
          this.template.elements.data[key][pname] = value[pname];}}
      else {
        this.template.elements.data[key] = value;}}
    else {
      this.template.elements.data[key] = value;}
    return true;
  }
  
  save2DataUrlString(callback, filename) {
    if(callback)
      this.doc.save2DataUrlString((result) => {
        callback(result);
      }, filename);
    else
      return this.doc.save2DataUrlString(null, filename)
  }

  save2Pdf(callback) {
    if(callback)
      this.doc.save2Pdf((pdf) => {
        callback(pdf);
      });
    else
      return this.doc.save2Pdf()
  }
  
  save2Xml() {
    return "<data>"+this.template.xml.header+this.template.xml.details+"\n</data>";
  }

}

/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2019, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

const _getBuffer = Symbol('getBuffer');
const _rgb2Hex = Symbol('rgb2Hex');

class KitDocument {
  constructor(options) {

    this.pdf = new PDFDocument({
      size: (options.format) ? String(options.format).toUpperCase() : "A4",
      layout : options.orientation || "portrait",
      margin: 0
    });
    this.pdf.on('pageAdded', () => {
      this.state.pageNumber += 1; options.pageCallback(this.state.pageNumber);} );

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
    };

    options.fonts.forEach(font => {
      this.pdf.registerFont(font.fontName, font.bufferFont);
      if(!this.fontMap[font.fontFamily])
        this.fontMap[font.fontFamily] = {};
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
    };
    if(options.fontFamily)
      this.setFont(options.fontFamily);
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
      return Number(parseInt(dec,10)).toString(16); };
    const pad = (h) => {
      if(h.length==1) return "0"+h;
      else return h; };
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
    this.pdf.addPage(options);
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
      color = this[_rgb2Hex](color, color, color);
    this.state.font.drawColor = color;
  }

  setFont(fontFamily) {
    if(this.fontMap[fontFamily]){
      try {
        this.pdf.font(this.fontName);
        this.state.font.family = fontFamily;
      } catch (error) {
        this.state.font.family = "times";
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
      color = this[_rgb2Hex](color, color, color);
    this.state.font.fillColor = color;
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
    this.state.font.textColor = color;
    this.pdf.fillColor(color);
  }

  text(value, x, y, options) {
    options = options || {};
    options.baseline = 0;
    this.pdf.font(this.fontName).fillColor(this.state.font.textColor).text(value, x, y, options);
    //width: Number
    //align: 'left', 'center', 'right', 'justify'
  }

  rect(x, y, width, height, style) {
    if(style === "F")
      this.pdf.rect(x, y, width, height).fill(this.state.font.fillColor);
    else
      this.pdf.rect(x, y, width, height).stroke(this.state.font.drawColor);
  }

  line(x1, y1, x2, y2){
    this.pdf.moveTo(x1, y1).lineTo(x2, y2).stroke(this.state.font.drawColor);
  }

  fromHTML(HTML, x, y, settings, callback, margins) {
    let doc = new xmldom.DOMParser().parseFromString(HTML, "text/html");
    if(doc){
      let txt = "\n";
      for (let index = 0; index < doc.childNodes.length; index++) {
        const element = doc.childNodes[index];
        txt += String(element.textContent).trim()+"\n";
      }
      this.text(txt, x, y, { width: settings.width });}
    callback({ y: this.pdf.y });
  }

  splitTextToSize(text, maxlen, options) {
    return this.pdf.heightOfString(text, { width: maxlen, baseline: 0 });
  }

  save2DataUrlString(callback, filename){
    this[_getBuffer]((buffer) => {
      filename = (filename) ? "filename="+filename+";" : "";
      callback('data:application/pdf;'+filename+'base64,'+buffer.toString('base64'));
    });
  }

  save2Pdf(callback) {
    this[_getBuffer]((buffer) => {
      let arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset, buffer.byteOffset + buffer.byteLength );
      callback(arrayBuffer);
    });
  }

}

/*
This file is part of the Nervatura Framework
http://nervatura.com
Copyright © 2011-2019, Csaba Kappel
License: LGPLv3
https://raw.githubusercontent.com/nervatura/nervatura/master/LICENSE
*/

class Report extends NtReport {
	constructor(_orientation, _unit, _format) {
    
    let options = { 
      orientation: _orientation || "portrait",
      unit: _unit || "mm",
      format: _format || "a4",
      textFilter: [],
      fontFamily: "roboto", fontSize: 10
    };
    let _fonts = [];
    let _fontFiles = [
      { name: "Roboto", family: "roboto", style: "normal", file: "RobotoSlab-Regular.ttf" },
      { name: "Roboto-Bold", family: "roboto", style: "bold", file: "RobotoSlab-Bold.ttf" },
      { name: "Roboto-Italic", family: "roboto", style: "italic", file: "Roboto-Italic.ttf" },
      { name: "Roboto-BoldItalic", family: "roboto", style: "bolditalic", file: "Roboto-BoldItalic.ttf" }
    ];
    _fontFiles.forEach(_font => {
      if (fs.existsSync(__dirname+"/../fonts/"+_font.file)) {
        _fonts.push({ 
          fontName: _font.name, fontFamily: _font.family, fontStyle: _font.style,
          bufferFont: fs.readFileSync(__dirname+"/../fonts/"+_font.file)
        });
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
    return super.getXmlTemplate(new xmldom.DOMParser(), new xmldom.XMLSerializer())
  }

  loadDefinition(data) {
    return super.loadDefinition(data, new xmldom.DOMParser())
  }

  save2PdfFile(fileName){
    if(fs.createWriteStream)
      this.doc.pdf.pipe(fs.createWriteStream(fileName));
      this.doc.pdf.end();
  }
}

module.exports = Report;
