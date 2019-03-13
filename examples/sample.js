
function createJsReport(rpt, logo) {

  //default values
  rpt.template.document.title = "Nervatura Report";

  //header
  var header = rpt.template.elements.header;
  var row_data = rpt.insertElement(header, "row", -1, {height: 10});
  if(logo){
    rpt.insertElement(row_data, "image",-1,{src: logo});
  } else {
    rpt.insertElement(row_data, "image",-1,{src: "logo"});
  }
  rpt.insertElement(row_data, "cell",-1,{
    name:"label", value:"labels.title", "font-style": "bolditalic", "font-size": 26, color: "#D8DBDA"});
  rpt.insertElement(row_data, "cell",-1,{
    name:"label", value:"Javascript Sample", "font-style": "bold", align: "right"});
  rpt.insertElement(header, "vgap", -1, {height: 2});
  rpt.insertElement(header, "hline", -1, {"border-color": 218});
  rpt.insertElement(header, "vgap", -1, {height: 2});

  //details
  var details = rpt.template.elements.details;
  rpt.insertElement(details, "vgap", -1, {height: 2});
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", width: "50%", "font-style": "bold", value: "labels.left_text", border: "LT", 
    "border-color": 218, "background-color": 245});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", "font-style": "bold", value: "labels.left_text", border: "LTR", 
    "border-color": 218, "background-color": 245});
  
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", width: "50%", value: "head.short_text", border: "L", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", value: "head.short_text", border: "LR", "border-color": 218});
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", width: "50%", value: "head.short_text", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", value: "head.short_text", border: "LBR", "border-color": 218});
  
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", width: "40", "font-style": "bold", value: "labels.left_text", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", align: "center", width: "30", "font-style": "bold", value: "labels.center_text", 
    border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", align: "right", width: "40", "font-style": "bold", value: "labels.right_text", 
    border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", "font-style": "bold", value: "labels.left_text", border: "LBR", "border-color": 218});
  
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", width: "40", value: "head.short_text", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "date", align: "center", width: "30", value: "head.date", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "amount", align: "right", width: "40", value: "head.number", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", value: "head.short_text", border: "LBR", "border-color": 218});
  
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", "font-style": "bold", value: "labels.left_text", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", width: "50", value: "head.short_text", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", "font-style": "bold", value: "labels.left_text", border: "LB", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", value: "head.short_text", border: "LBR", "border-color": 218});
  
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "long_text", "multiline": "true", value: "head.long_text", border: "LBR", "border-color": 218});

  rpt.insertElement(details, "vgap", -1, {height: 2});
  row_data = rpt.insertElement(details, "row", -1, {hgap: 2});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", value: "labels.left_text", "font-style": "bold", border: "1", "border-color": 245, 
    "background-color": 245});
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", value: "head.short_text", border: "1", "border-color": 218});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", value: "labels.left_text", "font-style": "bold", border: "1", "border-color": 245, "background-color": 245});
  rpt.insertElement(row_data, "cell",-1,{
    name: "short_text", value: "head.short_text", border: "1", "border-color": 218});
  
  rpt.insertElement(details, "vgap", -1, {height: 2});
  row_data = rpt.insertElement(details, "row", -1, {hgap: 2});
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", value: "labels.long_text", "font-style": "bold", border: "1", "border-color": 245, "background-color": 245});
  rpt.insertElement(row_data, "cell",-1,{
    name: "long_text", "multiline": "true", value: "head.long_text", border: "1", "border-color": 218});
  
  rpt.insertElement(details, "vgap", -1, {height: 2});
  rpt.insertElement(details, "hline", -1, {"border-color": 218});
  rpt.insertElement(details, "vgap", -1, {height: 2});
  
  row_data = rpt.insertElement(details, "row", -1, {"hgap": 3});
  rpt.insertElement(row_data, "cell",-1,{
    "name": "label", "value": "Barcode (Interleaved 2of5)", "font-style": "bold", "font-size": 9,
    "border": "1", "border-color": 245, "background-color": 245});
  rpt.insertElement(row_data, "barcode",-1,{"code-type": "ITF", "value": "1234567890", "visible-value":1});
  rpt.insertElement(row_data, "cell",-1,{
    "name": "label", "value": "Barcode (Code 39)", "font-style": "bold", "font-size": 9, 
    "border": "1", "border-color": 245, "background-color": 245});
  rpt.insertElement(row_data, "barcode",-1,{"code-type": "CODE_39", "value": "1234567890ABCDEF", "visible-value":1});
  
  rpt.insertElement(details, "vgap", -1, {height: 3});
  
  row_data = rpt.insertElement(details, "row");
  rpt.insertElement(row_data, "cell",-1,{
    name: "label", value: "Datagrid Sample", align: "center", "font-style": "bold", 
    border: "1", "border-color": 245, "background-color": 245});
  rpt.insertElement(details, "vgap", -1, {height: 2});
  
  var grid_data = rpt.insertElement(details, "datagrid", -1, {
    name: "items", databind: "items", border: "1", "border-color": 218, "header-background": 245, "footer-background": 245});
  rpt.insertElement(grid_data, "column",-1,{
    width: "8%", fieldname: "counter", align: "right", label: "labels.counter", footer: "labels.total"});
  rpt.insertElement(grid_data, "column",-1,{
    width: "20%", fieldname: "date", align: "center", label: "labels.center_text"});
  rpt.insertElement(grid_data, "column",-1,{
    width: "15%", fieldname: "number", align: "right", label: "labels.right_text", 
    footer: "items_footer.items_total", "footer-align": "right"});
  rpt.insertElement(grid_data, "column",-1,{
    fieldname: "text", label: "labels.left_text"});
  
  rpt.insertElement(details, "vgap", -1, {height: 5});
  rpt.insertElement(details, "html", -1, {fieldname: "html_text", 
    html: "<i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</i> ={{html_text}} Nulla a pretium nunc, in cursus quam."});
    
  //footer
  var footer = rpt.template.elements.footer;
  rpt.insertElement(footer, "vgap", -1, {height: 2});
  rpt.insertElement(footer, "hline", -1, {"border-color": 218});
  row_data = rpt.insertElement(footer, "row", -1, {height: 10});
  rpt.insertElement(row_data, "cell",-1,{value: "Nervatura Report Template", "font-style": "bolditalic"});
  rpt.insertElement(row_data, "cell",-1,{value: "{{page}}", align: "right", "font-style": "bold"});
  
  //data
  rpt.setData("labels", {"title": "REPORT TEMPLATE", "left_text": "Short text", "center_text": "Centered text", 
                                      "right_text": "Right text", "long_text": "Long text", "counter": "No.", "total": "Total"});
  rpt.setData("head", {"short_text": "Lorem ipsum dolor", "number": "123 456", "date": "2015.01.01", 
                                    "long_text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eu mattis diam, sed dapibus justo. In eget augue nisi. Cras eget odio vel mi vulputate interdum. Curabitur consequat sapien at lacus tincidunt, at sagittis felis lobortis. Aenean porta maximus quam eu porta. Fusce sed leo ut justo commodo facilisis. Vivamus vitae tempor erat, at ultrices enim. Nulla a pretium nunc, in cursus quam."});
  rpt.setData("html_text", "<p><b>Pellentesque eu mattis diam, sed dapibus justo. In eget augue nisi. Cras eget odio vel mi vulputate interdum. Curabitur consequat sapien at lacus tincidunt, at sagittis felis lobortis. Aenean porta maximus quam eu porta. Fusce sed leo ut justo commodo facilisis. Vivamus vitae tempor erat, at ultrices enim.</b></p>");
  rpt.setData("items_footer", {"items_total": "3 703 680"});
  var items = [];
  for(var i=0; i<3; i++) {
    items.push({"text": "Lorem ipsum dolor", "number": "123 456", "date": "2015.01.01"});}
  items.push({"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eu mattis diam, sed dapibus justo. In eget augue nisi. Cras eget odio vel mi vulputate interdum. Curabitur consequat sapien at lacus tincidunt, at sagittis felis lobortis. Aenean porta maximus quam eu porta. Fusce sed leo ut justo commodo facilisis. Vivamus vitae tempor erat, at ultrices enim. Nulla a pretium nunc, in cursus quam.", "number": "123 456", "date": "2015.01.01"});
  for(var i=0; i<20; i++) {
    items.push({"text": "Lorem ipsum dolor", "number": "123 456", "date": "2015.01.01"});}
  rpt.setData("items", items);
  if(!logo){
    rpt.setData("logo", "data:image/jpg;base64,/9j/4AAQSkZJRgABAQIA7ADsAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wgARCABAAEADAREAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAQGAQMFAgf/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAABuYAAAAAAPCQZno3eCBMc+YjyRJnmzndenq6F3VMefg55Abl2W37p68Hznl4sHolXcWYs2+9h12wUPn5MGCLM9C7u/T1ejmzEaZr2eOiTr66WfXfbaAAAAP/EACMQAAICAgEDBQEAAAAAAAAAAAIDAQQABRATITAREhQVIjH/2gAIAQEAAQUC8xEIRXd8hvDLtdWFtl5O2LC2VksMzZNJfSq5sLkkfMh7QrK61jJ7D/eIiSn8oyZkp1aPQeG1yW/prHCd2ypVKyyIgYy1Fks+tCVMpvVMKZOV9YZYtYqDxf/EACERAAEDAwUBAQAAAAAAAAAAAAEAAhEQE0EDEiAwUSEy/9oACAEDAQE/Ae8Gal4CuhXVcciZTBApqPwOEQmiTy/NNMZqW/YUDK3eUY3dV27CtiEWEKCm6fqAjr//xAAbEQACAgMBAAAAAAAAAAAAAAABEQAQEiAwQP/aAAgBAgEBPwHxOZTKOhROo4C1oBZiipdP/8QAKRAAAQMCBAUEAwAAAAAAAAAAAQACEQMhEDFBYRIiMHGRICNRoTJCYv/aAAgBAQAGPwLrS4gDdPe38G2G+MF8n4C5abj3VqQ8qxDewUvcXd0wam5wNFhhoz39EuzOQTGb3wJxgCStHVPpqkmSjWOthi6l4k6L3Ks7MuuGm3gb9nD+BmUALAYNFB0A5ohziah/cqDTJ3F1am7wprco+NVwMEAdP//EACUQAQACAAUEAQUAAAAAAAAAAAEAERAhMUFRMGFxkdEgobHw8f/aAAgBAQABPyHrOTrdVBvNQ/Ld/GLlPyMF90BNn/N4bX69vLQTlXL0KD3YJyybN30VyV5muWcEtvDfB9gIqlW1wMuTQJWt2evyMcuTNWMdz9XDWU0Ms0APK2bd7O3vSUMzZNN+RwoGZ/Chl0KA2wrmyj3JrMv3JVUcNItSXgcXG7fV8QIHbHT/AP/aAAwDAQACAAMAAAAQAAAAAAANEty9DknkCjioltiArqvAAAAA/8QAIBEBAAICAQQDAAAAAAAAAAAAAQARECExMEFRYSCRsf/aAAgBAwEBPxDrKG2X1OM8kx7BL+ItE5MoTCL8Bqt5laZW94BWia9n8iq2yst3y4xK+X1HShRhV6gVowFRNiF35iXE9cV3ACjp/wD/xAAcEQACAgIDAAAAAAAAAAAAAAABEQAQIEEwMVH/2gAIAQIBAT8Q5wXZARKPCSYCFahgoDOXVDuyhUQHcflMttRVCQiMHuALj//EACUQAQABAwMDBQEBAAAAAAAAAAERACExQWGBEHGhMFGRscEg0f/aAAgBAQABPxD1svViA+auiElpLweHV2B5GZspY5aAZ7T8WaeMjpN9AqIC2f8AVbp1cO04rVUIIZuv2IOOi6wWIdY7GN/4ljjsNngDoZc4iXhJN2N/AjmgAgsU4GUT4pyyFVyvR9TwOVe1QZRsCHb6bWDekkDISrUKcbppbvLBx0QCJI2aOgLdIIkBj9ofKRqE5wOFqEJMI/nTYg26G0Kjt+zd8Zo+oglgYOjrVq4PZZdM4vTGblwoNInHvN6ZaDOXkxzFaDikH6rUecg/h5O1BLC32Lq7+n//2Q==");
  }
    
  return rpt;
}

try {
  window.createJsReport = createJsReport  
} catch (error) {
  module.exports.createJsReport = createJsReport
}
