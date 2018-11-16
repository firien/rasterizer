(function() {
  // read SVG, parse into DOM, convert to blob
  var $sizes, dropHandler, generateBlob, processFile, readFile;

  processFile = function(e, name, sizes) {
    var dom, svg, text, zip;
    name = name.replace(/\.[^\/.]+$/, '');
    text = e.target.result;
    dom = document.implementation.createHTMLDocument('svg');
    dom.open();
    dom.write(text);
    dom.close();
    svg = dom.body.firstElementChild;
    zip = new JSZip();
    return Promise.all(sizes.map(function(size) {
      return generateBlob(size.size * size.scale, svg).then(function(blob) {
        var filename;
        filename = `${name}-${size.size}`;
        if (size.scale > 1) {
          filename += `@${size.scale}x`;
        }
        return zip.file(`${filename}.png`, blob);
      });
    })).then(function() {
      return zip.generateAsync({
        type: 'blob'
      }).then(URL.createObjectURL).then(function(url) {
        var anchor;
        anchor = document.createElement('a');
        anchor.setAttribute('download', `${name}.zip`);
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

  readFile = function(file, sizes) {
    var fileReader;
    fileReader = new FileReader();
    fileReader.onloadend = function(e) {
      return processFile(e, file.name, sizes);
    };
    return fileReader.readAsText(file);
  };

  dropHandler = function(e) {
    var file, i, input, j, len, len1, ref, ref1, ref2, results, size, sizes, x2, x3;
    // get selected sizes
    sizes = [];
    x2 = document.getElementById('x2').checked;
    x3 = document.getElementById('x3').checked;
    ref = document.querySelectorAll('ul input:checked');
    for (i = 0, len = ref.length; i < len; i++) {
      input = ref[i];
      size = Number(input.value);
      sizes.push({
        size: size,
        scale: 1
      });
      if (x2) {
        sizes.push({
          size: size,
          scale: 2
        });
      }
      if (x3) {
        sizes.push({
          size: size,
          scale: 3
        });
      }
    }
    if (((ref1 = e.dataTransfer.files) != null ? ref1.length : void 0) > 0) {
      e.stopPropagation();
      e.preventDefault();
      ref2 = e.dataTransfer.files;
      results = [];
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        file = ref2[j];
        results.push(readFile(file, sizes));
      }
      return results;
    }
  };

  window.addEventListener('drop', dropHandler);

  window.addEventListener('dragover', function(e) {
    return e.preventDefault();
  });

  $sizes = [];

  document.addEventListener('DOMContentLoaded', function() {
    var form;
    form = document.querySelector('form#new-size');
    return form.addEventListener('submit', function(e) {
      var checkbox, i, id, label, len, li, size, ul;
      e.preventDefault();
      e.stopPropagation();
      if (form.checkValidity()) {
        size = form['image-size'].value;
        // ensure it is unique
        if (!$sizes.includes(size)) {
          $sizes.push(size);
          $sizes.sort();
          ul = document.querySelector('ul');
          while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
          }
          for (i = 0, len = $sizes.length; i < len; i++) {
            size = $sizes[i];
            li = document.createElement('li');
            checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('value', size);
            id = `A${size}`;
            checkbox.setAttribute('id', id);
            checkbox.checked = true;
            label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = size;
            li.appendChild(checkbox);
            li.appendChild(label);
            ul.appendChild(li);
          }
        }
        return form.reset();
      }
    });
  });

}).call(this);
