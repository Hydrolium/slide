import { openEditorPopup } from './popup/editor_popup'
import { Slide } from './slide'
import './style/slide_style.css'
import './style/style.css'
import { openSortPopup } from './popup/sort_popup'
import { openAddFilePopup } from './popup/add_file_popup'
import { openSettingPopup } from './popup/setting_popup'
import { songSetting, type SongContext } from './song_settingt'
import { openManageFilePopup } from './popup/manage_file'

export const $createDiv = (text: string, ...classes: string[]) => {
    const element_div: HTMLDivElement = document.createElement('div')
    element_div.textContent = text
    element_div.classList.add(...classes)

    return element_div
}

export const $create = (tag: string, ...classes: string[]) => {
    const element_div = document.createElement(tag)
    element_div.classList.add(...classes)

    return element_div
}

let slideShowWindow: Window | null = null;

const element_slideBox = document.querySelector<HTMLUListElement>("#slide-box")

const element_addFilesButton = document.querySelector<HTMLButtonElement>("#add-files")
const element_manageFilesButton = document.querySelector<HTMLButtonElement>("#manage-files")
const element_resortButton = document.querySelector<HTMLButtonElement>("#resort-slides")
const element_openButton = document.querySelector<HTMLButtonElement>("#open_viewer")
const element_exportButton = document.querySelector<HTMLButtonElement>("#export-slides")
const elmeent_editSettingButton = document.querySelector<HTMLButtonElement>("#edit-setting")


const sendToPopup = (data: any) => {
  if (slideShowWindow && !slideShowWindow.closed) {
    slideShowWindow.postMessage(data, window.location.origin);
  }
}

const openShow = () => {
  if(slideShowWindow) slideShowWindow.close()

  slideShowWindow = window.open('slide_show.html', 'MyPopup', 'width=500,height=600')
}

let titleFontSize = '90'
let textFontSize = '80'

const updateSong = () => {

  element_slideBox?.replaceChildren()

  if(songSetting.isEmpty()) {
    sendToPopup({type: "CLOSE"})
    return
  }

  songSetting.order.forEach(id => {

    const created_slide_li = document.createElement('li')
    created_slide_li.classList.add("slide-li")

    const song = songSetting.getSongWithId(id)

    song.texts.forEach((text, idx) => {

      const context: SongContext = {
          ...song,
          text: text,
          background: songSetting.imgUrls[song.background]?.url
        }

      const slide = new Slide(context, id === songSetting.currentSongId && idx === songSetting.currentTextIndex).render()

      slide.addEventListener("click", () => {
        songSetting.goto(id, idx)
        updateSong()
      })

      slide.addEventListener("contextmenu", async (event: MouseEvent) => {
        event.preventDefault()

        const result = await openEditorPopup({...context, id: id, textIdx: idx})

        if(result) songSetting.modifySong(result)

        updateSong()
      })

      created_slide_li.appendChild(slide)
    })

    element_slideBox?.appendChild(created_slide_li)
    

  })

  sendToPopup({type: 'CHANGE', context: songSetting.currentContext})
}

const resizeTitle = (pixel: string) => {
  titleFontSize = pixel
  sendToPopup({type: "RESIZE_TITLE", data: pixel})
}

const resizeText = (pixel: string) => {
  textFontSize = pixel
  sendToPopup({type: "RESIZE_TEXT", data: pixel})
}

element_addFilesButton?.addEventListener('click', async () => {
  const result = await openAddFilePopup()
  if(result) await songSetting.loadFiles(result)

  sendToPopup({type: 'UPDATE_BACKGROUND', data: songSetting.imgUrls})

  updateSong()
})

element_manageFilesButton?.addEventListener('click', async () => {
  
  const aboutJsonFile: Record<string, string> = {}
  Object.entries(songSetting.jsonFiles).forEach(([fileName, data]) => {
    aboutJsonFile[fileName] = `${data.map(d => d.title).join(', ')}`
  })
  
  const result = await openManageFilePopup(aboutJsonFile, songSetting.imgUrls)
  if(result) songSetting.manageFile(Object.keys(result.jsonCandidates), Object.keys(result.imgCandidates));

  updateSong()
})

element_resortButton?.addEventListener('click', async () => {
  
  const result = await openSortPopup(songSetting.order, songSetting.songs)
  if(result) songSetting.resortOrder(result)

  updateSong()
})

element_openButton?.addEventListener('click', () => {
  openShow()
})

element_exportButton?.addEventListener('click', async () => {

  const downloadUrl = await songSetting.getExportLink()

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = 'settings'
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)

})

elmeent_editSettingButton?.addEventListener('click', () =>
  openSettingPopup(titleFontSize, textFontSize, resizeTitle, resizeText)
)

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if(event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return

  switch(event.key) {
    case "ArrowLeft":
      songSetting.previous()
      updateSong()
      break
    case "ArrowRight":
      songSetting.next()
      updateSong()
      break
  }
})

window.addEventListener('message', (event: MessageEvent) => {
  if (event.origin !== window.location.origin) return;

  switch(event.data) {
    case "REQUEST_PREVIOUS":
      songSetting.previous()
      updateSong()
      break
    case "REQUEST_NEXT":
      songSetting.next()
      updateSong()
      break
    case "REQUEST_INITIALIZATION":
      sendToPopup({type: 'UPDATE_BACKGROUND', data: songSetting.imgUrls})

      if(songSetting.isEmpty()) return

      sendToPopup({type: 'CHANGE', context: songSetting.currentContext })
      break
  }

});
