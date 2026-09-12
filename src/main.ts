import JSZip from 'jszip'
import { openPopup } from './popup_editor'
import { Slide } from './slide'
import './style/slide_style.css'
import './style/style.css'
import { openSortPopup } from './sort_popup'
import { openManageFilePopup } from './manage_file_popup'
import { openSettingPopup } from './setting_popup'

export interface SongContext {
  readonly title: string
  readonly text: string
  readonly background: string
  readonly titleColor: string
  readonly titleStroke: string
  readonly titleShadow: string
  readonly textColor: string
  readonly textStroke: string
  readonly textShadow: string
}

interface SongInfo {
  readonly texts: string[]
  readonly background: string
  readonly titleColor: string
  readonly titleStroke: string
  readonly titleShadow: string
  readonly textColor: string
  readonly textStroke: string
  readonly textShadow: string
}

interface SongInfoJSONFormat extends SongInfo {
  readonly title: string
}

interface SongSetting {
  songs: Record<string, SongInfo>
  order: string[]
  currentSong: string
  currentTextIndex: number
}

export interface ImageInfo {
  readonly file: File
  url: string
}

let slideShowWindow: Window | null = null;

const element_slideBox = document.querySelector<HTMLUListElement>("#slide-box")

const element_manageImages = document.querySelector<HTMLButtonElement>("#manage-imges")
const element_resortButton = document.querySelector<HTMLButtonElement>("#resort-slides")
const element_resetButton = document.querySelector<HTMLButtonElement>("#reset-slides")
const element_openButton = document.querySelector<HTMLButtonElement>("#open_viewer")
const element_exportButton = document.querySelector<HTMLButtonElement>("#export-slides")
const elmeent_editSetting = document.querySelector<HTMLButtonElement>("#edit-setting")

const sendToPopup = (data: any) => {
  if (slideShowWindow && !slideShowWindow.closed) {
    slideShowWindow.postMessage(data, window.location.origin);
  }
}

const openShow = () => {
  if(slideShowWindow) slideShowWindow.close()

  slideShowWindow = window.open('slide_show.html', 'MyPopup', 'width=500,height=600')
}

let imgUrls: Record<string, ImageInfo> = {}
let songSetting: SongSetting = {songs: {}, order: [], currentSong: "", currentTextIndex: -1}

let titleFontSize = '90'
let textFontSize = '80'

const check = () => {

  if(songSetting.order.length === 0) return false
  if(songSetting.currentSong === "" || !songSetting.songs[songSetting.currentSong]) {
    songSetting.currentSong = songSetting.order[0]
    songSetting.currentTextIndex = 0
  }

  return true
}

const getContext = () => {
  const song = songSetting.songs[songSetting.currentSong]

  return {
    ...song,
    title: songSetting.currentSong,
    text: song.texts[songSetting.currentTextIndex],
    background: song.background
  }
}

const previous: () => SongContext | undefined = () => {

  if(!check()) return
  
  songSetting.currentTextIndex--;

  if(songSetting.currentTextIndex < 0 ) {
    const songIdx = songSetting.order.indexOf(songSetting.currentSong) - 1

    if(songIdx < 0) {
      songSetting.currentTextIndex = 0
      return
    }

    const songTitle = songSetting.order[songIdx]

    songSetting.currentSong = songTitle
    songSetting.currentTextIndex = songSetting.songs[songTitle].texts.length - 1
  }

  updateSong()
  return getContext()
}

const next: () => SongContext | undefined = () => {

  if(!check()) return
  
  const song = songSetting.songs[songSetting.currentSong]

  songSetting.currentTextIndex++;

  if(songSetting.currentTextIndex >= song.texts.length) {
    const songIdx = songSetting.order.indexOf(songSetting.currentSong) + 1

    if(songIdx >= songSetting.order.length) {
      songSetting.currentTextIndex = song.texts.length -1
      return
    }

    songSetting.currentSong = songSetting.order[songIdx]
    songSetting.currentTextIndex = 0
  }


  updateSong()
  return getContext()
}

export const resort_order = (titles: string[]) => {
  
  const nts = new Set(titles)

  songSetting.order.forEach(t => {
    if(!nts.has(t)) {
      delete songSetting.songs[t]
    }
  })

  songSetting.order = [...titles]

  updateSong()

}

export const edit_setting = (originalTitle: string, targetTextIdx: number, newContext: SongContext) => {
  
  if(!songSetting.songs[originalTitle]) return

  const originalBackground = songSetting.songs[originalTitle].background
  const originalTexts = [...songSetting.songs[originalTitle].texts]
  originalTexts[targetTextIdx] = newContext.text

  if(originalTitle !== newContext.title) {
    delete songSetting.songs[originalTitle]

    songSetting.order.splice(
      songSetting.order.indexOf(originalTitle), 1, newContext.title
    )    
  }

  songSetting.songs[newContext.title] = {...newContext, texts: originalTexts, background: originalBackground}

  updateSong()
  
}

const updateSong = () => {

  element_slideBox?.replaceChildren()

  if(!check()) {
    sendToPopup({type: "CLOSE"})
    return
  }

  songSetting.order.forEach(title => {

    const created_slide_li = document.createElement('li')
    created_slide_li.classList.add("slide-li")

    const song = songSetting.songs[title]

    song.texts.forEach((text, idx) => {

      const context: SongContext = {
          ...song,
          title: title,
          text: text,
          background: imgUrls[song.background]?.url
        }

      const slide = new Slide(context, title == songSetting.currentSong && idx == songSetting.currentTextIndex).render()

      slide.addEventListener("click", () => {

        songSetting.currentSong = title
        songSetting.currentTextIndex = idx
        sendToPopup({type: 'CHANGE', context: context})
        updateSong()
      })

      slide.addEventListener("contextmenu", (event: MouseEvent) => {
        event.preventDefault()

        openPopup(context, idx)
      })

      created_slide_li.appendChild(slide)
    })

    element_slideBox?.appendChild(created_slide_li)
    

  })

  sendToPopup({type: 'CHANGE', context: getContext()})
}

export const loadFiles = (files: File[]) => {
  
  if (!files || files.length === 0) return


  const jsonFiles: Promise<string>[] = []

  for(const file of files) { 

    if(file.type.includes('json')) {
      jsonFiles.push(file.text())
    }
    else if (file.type.startsWith('image/')) {
      
      if(file.name in imgUrls) URL.revokeObjectURL(imgUrls[file.name].url)

      imgUrls[file.name] = {file: file, url: URL.createObjectURL(file)}

    }
  }

  Promise.all(jsonFiles).then(jsons => {
    jsons.forEach(json => {
      const parsed = JSON.parse(json)

      const parseSong = (p: SongInfoJSONFormat) => {
        if(!songSetting.songs[p.title]) songSetting.order.push(p.title)
        songSetting.songs[p.title] = p
      }

      if(Array.isArray(parsed)) parsed.forEach(v => parseSong(v))
      else parseSong(parsed)
      
    })

    sendToPopup({type: 'UPDATE_BACKGROUND', data: imgUrls})
    updateSong()
  })
}

export const resizeTitle = (pixel: string) => {
  titleFontSize = pixel
  sendToPopup({type: "RESIZE_TITLE", data: pixel})
}

export const resizeText = (pixel: string) => {
  textFontSize = pixel
  sendToPopup({type: "RESIZE_TEXT", data: pixel})
}

element_manageImages?.addEventListener('click', () => {
  openManageFilePopup()
})

element_resortButton?.addEventListener('click', () => {
  openSortPopup(songSetting.order)
})

element_resetButton?.addEventListener('click', () => {

  if(!confirm('모든 슬라이드를 삭제하시겠습니까?')) return
  Object.values(imgUrls).forEach(({url}) => {
    URL.revokeObjectURL(url)
  })

  imgUrls = {}
  songSetting = {songs: {}, order: [], currentSong: "", currentTextIndex: -1}

  updateSong()
})

element_openButton?.addEventListener('click', () => {
  openShow()
})

element_exportButton?.addEventListener('click', async () => {
  const export_list: SongInfoJSONFormat[] = []
  songSetting.order.forEach(title => {
    const info = songSetting.songs[title]

    export_list.push({title: title, ...info})
  })

  const zip = new JSZip()

  const jsonString = JSON.stringify(export_list, null, 2)
  zip.file('data.json', jsonString)

  Object.values(imgUrls).forEach(({file}) => {
    zip.file(file.name, file)
  })

  const zipBlob = await zip.generateAsync({type: 'blob'})
  const downloadUrl = URL.createObjectURL(zipBlob)

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = 'settings'
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)

})

elmeent_editSetting?.addEventListener('click', () =>
  openSettingPopup(titleFontSize, textFontSize)
)

window.addEventListener('keydown', (event: KeyboardEvent) => {

  switch(event.key) {
    case "ArrowLeft":
      previous()
      break
    case "ArrowRight":
      next()
      break
  }
})

window.addEventListener('message', (event: MessageEvent) => {
  if (event.origin !== window.location.origin) return;

  let context
  switch(event.data) {
    case "REQUEST_PREVIOUS":
      context = previous()
      if(context) sendToPopup({type: 'CHANGE', context: context})
      break
    case "REQUEST_NEXT":
      context = next()
      if(context) sendToPopup({type: 'CHANGE', context: context})
      break
    case "REQUEST_INITIALIZATION":
      sendToPopup({type: 'UPDATE_BACKGROUND', data: imgUrls})

      if(!check()) return

      sendToPopup({type: 'CHANGE', context: getContext() })
      break
  }

  
});
