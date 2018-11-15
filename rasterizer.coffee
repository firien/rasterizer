# read SVG, parse into DOM, convert to blob
processFile = (e, name) ->
  name = name.replace(/\.[^/.]+$/, '')
  text = e.target.result
  dom = document.implementation.createHTMLDocument('svg')
  dom.open()
  dom.write(text)
  dom.close()
  svg = dom.body.firstElementChild
  sizes = []
  for opt in document.getElementById('sizes').selectedOptions
    sizes.push opt.value
  zip = new JSZip()
  Promise.all(sizes.map((size) ->
    generateBlob(size, svg).then((blob) ->
      zip.file("#{name}-#{size}.png", blob)
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

readFile = (file) ->
  fileReader = new FileReader()
  fileReader.onloadend = (e) ->
    processFile(e, file.name)
  fileReader.readAsText(file)

dropHandler = (e) ->
  if e.dataTransfer.files?.length > 0
    e.stopPropagation()
    e.preventDefault()
    for file in e.dataTransfer.files
      readFile(file)
window.addEventListener('drop', dropHandler)
window.addEventListener('dragover', (e) ->
  e.preventDefault()
)
