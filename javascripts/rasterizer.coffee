# read SVG, parse into DOM, convert to blob
processFile = (e, name, sizes) ->
  name = name.replace(/\.[^/.]+$/, '')
  text = e.target.result
  dom = document.implementation.createHTMLDocument('svg')
  dom.open()
  dom.write(text)
  dom.close()
  svg = dom.body.firstElementChild
  zip = new JSZip()
  Promise.all(sizes.map((size) ->
    generateBlob(size.size * size.scale, svg).then((blob) ->
      filename = "#{name}-#{size.size}"
      if size.scale > 1
        filename += "@#{size.scale}x"
      zip.file("#{filename}.png", blob)
    )
  )).then( ->
    zip.generateAsync(type: 'blob').then(URL.createObjectURL).then((url) ->
      anchor = document.createElement('a')
      anchor.setAttribute('download', "#{name}.zip")
      anchor.href = url
      anchor.click()
    )
  )

generateBlob = (size, svg) ->
  svg = svg.cloneNode(true)
  new Promise((resolve, reject) ->
    svg.setAttribute('height', size)
    svg.setAttribute('width', size)
    b64 = window.btoa svg.outerHTML
    # use data uri to prevent canvas tainting
    # from converting to base64 -> blob
    dataUri = "data:image/svg+xml;charset=utf-8," + svg.outerHTML
    image = new Image()
    image.src = dataUri
    image.onload = (e) ->
      canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      context = canvas.getContext '2d'
      context.drawImage(image, 0, 0)
      canvas.toBlob(resolve, 'image/png')
  )

readFile = (file, sizes) ->
  fileReader = new FileReader()
  fileReader.onloadend = (e) ->
    processFile(e, file.name, sizes)
  fileReader.readAsText(file)

dropHandler = (e) ->
  # get selected sizes
  sizes = []
  include2x = document.getElementById('x2').checked
  include3x = document.getElementById('x3').checked
  for input in document.querySelectorAll('ul input:checked')
    size = Number(input.value)
    sizes.push(size: size, scale: 1)
    if include2x
      sizes.push(size: size, scale: 2)
    if include3x
      sizes.push(size: size, scale: 3)
  if e.dataTransfer.files?.length > 0
    e.stopPropagation()
    e.preventDefault()
    for file in e.dataTransfer.files
      readFile(file, sizes)
window.addEventListener('drop', dropHandler)
window.addEventListener('dragover', (e) ->
  e.preventDefault()
)

$sizes = []
document.addEventListener('DOMContentLoaded', ->
  form = document.querySelector('form#new-size')
  form.addEventListener('submit', (e) ->
    e.preventDefault()
    e.stopPropagation()
    if form.checkValidity()
      size = Number(form['image-size'].value)
      # ensure it is unique
      if not $sizes.includes(size)
        $sizes.push size
        $sizes.sort((a,b) -> a - b)
        ul = document.querySelector('ul')
        while ul.firstChild
          ul.removeChild(ul.firstChild)
        for size in $sizes
          li = document.createElement('li')
          checkbox = document.createElement('input')
          checkbox.setAttribute('type', 'checkbox')
          checkbox.setAttribute('value', size)
          id = "A#{size}"
          checkbox.setAttribute('id', id)
          checkbox.checked = true
          label = document.createElement('label')
          label.setAttribute('for', id)
          label.textContent = size
          li.appendChild checkbox
          li.appendChild label
          ul.appendChild li
      form.reset()
  )
)
