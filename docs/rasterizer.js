(function() {
  // read SVG, parse into DOM, convert to blob
  var dropHandler, generateBlob, processFile, readFile;

  processFile = function(e) {
    var dom, i, len, opt, ref, sizes, svg, text, zip;
    text = e.target.result;
    dom = document.implementation.createHTMLDocument('svg');
    dom.open();
    dom.write(text);
    dom.close();
    svg = dom.body.firstElementChild;
    sizes = [];
    ref = document.getElementById('sizes').selectedOptions;
    for (i = 0, len = ref.length; i < len; i++) {
      opt = ref[i];
      sizes.push(opt.value);
    }
    zip = new JSZip();
    return Promise.all(sizes.map(function(size) {
      return generateBlob(size, svg).then(function(blob) {
        return zip.file(`image-${size}.png`, blob);
      });
    })).then(function() {
      return zip.generateAsync({
        type: 'blob'
      }).then(URL.createObjectURL).then(function(url) {
        var anchor;
        anchor = document.createElement('a');
        anchor.setAttribute('download', 'icons.zip');
        anchor.href = url;
        return anchor.click();
      });
    });
  };

  generateBlob = function(size, svg) {
    svg = svg.cloneNode(true);
    return new Promise(function(resolve, reject) {
      var b64, dataUri, image;
      svg.setAttribute('height', size);
      svg.setAttribute('width', size);
      b64 = window.btoa(svg.outerHTML);
      // use data uri to prevent canvas tainting
      // from converting to base64 -> blob
      dataUri = "data:image/svg+xml;charset=utf-8," + svg.outerHTML;
      image = new Image();
      image.src = dataUri;
      return image.onload = function(e) {
        var canvas, context;
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return canvas.toBlob(resolve, 'image/png');
      };
    });
  };

  readFile = function(file) {
    var fileReader;
    fileReader = new FileReader();
    fileReader.onloadend = processFile;
    return fileReader.readAsText(file);
  };

  dropHandler = function(e) {
    var file, i, len, ref, ref1, results;
    if (((ref = e.dataTransfer.files) != null ? ref.length : void 0) > 0) {
      e.stopPropagation();
      e.preventDefault();
      ref1 = e.dataTransfer.files;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        file = ref1[i];
        results.push(readFile(file));
      }
      return results;
    }
  };

  window.addEventListener('drop', dropHandler);

  window.addEventListener('dragover', function(e) {
    return e.preventDefault();
  });

}).call(this);
