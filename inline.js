const { inlineSource } = require('inline-source');
const fs = require('fs');
const path = require('path');
const htmlpath = path.resolve('public/map.html');
let html;
 
console.log(htmlpath);
 
inlineSource(htmlpath, {
  compress: true,
  rootpath: path.resolve(__dirname+'/public'),
  // Skip all css types and png formats
  ignore: ['css', 'png']
})
  .then((html) => {
    // Do something with html
	console.log(html);
  })
  .catch((err) => {
    // Handle error
	console.log(err);
  });