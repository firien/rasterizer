import JSZip from 'jszip';
import pwa from 'esbuild-plugin-ghpages-pwa/src/pwa.js';

pwa('rasterizer');

const removeDropZone = () => {
  let dropZone = document.querySelector('#drop-zone')
  if (dropZone) {
    document.body.removeChild(dropZone)
  }
}
// read SVG, parse into DOM, convert to blob
const processFile = async function(e, name, sizes) {
  name = name.replace(/\.[^\/.]+$/, '');
  let text = e.target.result;
  let dom = document.implementation.createHTMLDocument('svg');
  dom.open();
  dom.write(text);
  dom.close();
  let svg = dom.body.firstElementChild;
  let zip = new JSZip();
  for (let size of sizes) {
    let blob = await generateBlob(size.size * size.scale, svg);
    let filename = `${name}-${size.size}`;
    if (size.scale > 1) {
      filename += `@${size.scale}x`;
    }
    zip.file(`${filename}.png`, blob);
  }
  let blob = await zip.generateAsync({type: 'blob'});
  let url = URL.createObjectURL(blob);
  let anchor = document.createElement('a');
  anchor.setAttribute('download', `${name}.zip`);
  anchor.href = url;
  return anchor.click();
};

const generateBlob = function(size, svg) {
  svg = svg.cloneNode(true);
  return new Promise(function(resolve, reject) {
    svg.setAttribute('height', size);
    svg.setAttribute('width', size);
    // use data uri to prevent canvas tainting
    // from converting to base64 -> blob
    let dataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.outerHTML);
    let image = new Image();
    image.src = dataUri;
    return image.onload = function(e) {
      let canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      let context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return canvas.toBlob(resolve, 'image/png');
    };
  });
};

const readFile = function(file, sizes) {
  let fileReader = new FileReader();
  fileReader.onloadend = function(e) {
    return processFile(e, file.name, sizes);
  };
  return fileReader.readAsText(file);
};

const dropHandler = function(e) {
  removeDropZone()
  // get selected sizes
  let sizes = [];
  let include2x = document.getElementById('x2').checked;
  let include3x = document.getElementById('x3').checked;
  for (let input of document.querySelectorAll('ul input:checked')) {
    let size = Number(input.value);
    sizes.push({size, scale: 1});
    if (include2x) {
      sizes.push({size, scale: 2});
    }
    if (include3x) {
      sizes.push({size, scale: 3});
    }
  }
  e.stopPropagation();
  e.preventDefault();
  if (sizes.length > 0) {
    if (e.dataTransfer.files?.length > 0) {
      for (let file of e.dataTransfer.files) {
        readFile(file, sizes);
      }
    }
  } else {
    alert('no sizes')
  }
};

window.addEventListener('drop', dropHandler);
window.addEventListener('dragleave', removeDropZone)
window.addEventListener('dragover', function(e) {
  e.preventDefault();
  let dropZone = document.querySelector('#drop-zone')
  if (!dropZone) {
    dropZone = document.createElement('div')
    dropZone.id = 'drop-zone'
    document.body.appendChild(dropZone)
  }
});

let $sizes = [];

document.addEventListener('DOMContentLoaded', function() {
  let form = document.querySelector('form#new-size');
  return form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (form.checkValidity()) {
      let size = Number(form['image-size'].value);
      // ensure it is unique
      if (!$sizes.includes(size)) {
        $sizes.push(size);
        $sizes.sort(function(a, b) {
          return a - b;
        });
        let ul = document.querySelector('ul');
        while (ul.firstChild) {
          ul.removeChild(ul.firstChild);
        }
        for (let size of $sizes) {
          let li = document.createElement('li');
          let checkbox = document.createElement('input');
          checkbox.setAttribute('type', 'checkbox');
          checkbox.setAttribute('value', size);
          let id = `A${size}`;
          checkbox.setAttribute('id', id);
          checkbox.checked = true;
          let label = document.createElement('label');
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
