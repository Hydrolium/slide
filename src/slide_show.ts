import type { ImageInfo, SongContext } from './main'
import { $createDiv } from './slide'
import './style/slide_style.css'

const element_slideLayerContainer = document.querySelector<HTMLDivElement>("#slide-layer-container")
const element_slideTitle = document.querySelector<HTMLDivElement>("#slide-title")
const element_slideText = document.querySelector<HTMLDivElement>("#slide-text")

let cachedLayers: Record<string, HTMLDivElement> = {}
let currentLayerName = ""

const update = (context: SongContext) => {
    if(!element_slideLayerContainer || !element_slideTitle || !element_slideText) return

    if(context.background !== currentLayerName) {
      const layer = cachedLayers[context.background]
      const currentLayer = cachedLayers[currentLayerName]
      
      if(currentLayer) currentLayer.classList.remove('visible')
      if(layer) {
        layer.classList.add('visible')
        currentLayerName = context.background
      }
      
    }

    element_slideTitle.textContent = context.title
    element_slideTitle.style.color = context.titleColor
    element_slideTitle.style.webkitTextStroke = `4px ${context.titleStroke}`
    element_slideTitle.style.textShadow = `8px 8px 0 ${context.titleShadow}`

    element_slideText.textContent = context.text
    element_slideText.style.color = context.textColor
    element_slideText.style.webkitTextStroke = `3px ${context.textStroke}`
    element_slideText.style.textShadow = `7px 7px 0 ${context.textShadow}`
}

window.addEventListener('message', (event: MessageEvent) => {

    const data = event.data

    if(data.type == 'CHANGE' && data.context) {
      update(data.context)
    }
    else if(data.type == 'CLOSE') {
      window.close()
    }
    else if(data.type == "RESIZE_TITLE") {
      if(element_slideTitle) element_slideTitle.style.fontSize = data.data + 'px'
    }
    else if(data.type == "RESIZE_TEXT") {
      console.log(data.data)
      if(element_slideText) element_slideText.style.fontSize = data.data + 'px'
    }
    else if(data.type == "UPDATE_BACKGROUND") {

      element_slideLayerContainer?.replaceChildren()
      cachedLayers = {}

      element_slideLayerContainer?.appendChild(
        $createDiv('', 'default_layer')
      )

      Object.entries(data.data as Record<string, ImageInfo>).forEach(
        ([name, info]) => {
          const created_layer = $createDiv('', 'slide-layer')

          created_layer.style.backgroundImage = `url(${info.url})`

          element_slideLayerContainer?.appendChild(created_layer)
          cachedLayers[name] = created_layer
        })
      

    }
});

window.addEventListener('keydown', (event: KeyboardEvent) => {

  switch(event.key) {
    case "ArrowLeft":
      window.opener.postMessage("REQUEST_PREVIOUS", window.location.origin);
      break;
    case "ArrowRight":
      window.opener.postMessage("REQUEST_NEXT", window.location.origin);
      break;
  }
})

window.addEventListener('DOMContentLoaded', () => {
  window.opener.postMessage("REQUEST_INITIALIZATION", window.location.origin)
})