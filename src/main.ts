import { Slide } from './slide'
import { SlideSorterPopup } from './popup/sort_popup'
import { songSetting, type SongContext } from './song_settingt'
import { FileManagerPopup } from './popup/manage_file'
import { addFooterButton } from './footer'
import { FileAdderPopup } from './popup/file_adder'
import { SettingEditorPopup } from './popup/setting_popup'
import { EditorPopup } from './popup/editor_popup'
import { SlideAddingOptionSetterPopup } from './popup/select_slide_adding_option_popup'

import './style/slide_style.css'
import './style/slide_list.css'
import { SlideDeletingOptionSetterPopup } from './popup/select_slide_deleting_option_popup'

export const $createDiv = (text: string, ...classes: string[]) => {
    const element_div: HTMLDivElement = document.createElement('div')
    element_div.textContent = text
    element_div.classList.add(...classes)

    return element_div
}

export const $createSpan = (text: string, ...classes: string[]) => {
    const element_div: HTMLSpanElement = document.createElement('span')
    element_div.textContent = text
    element_div.classList.add(...classes)

    return element_div
}

export const $create = <K extends keyof HTMLElementTagNameMap>(tag: K, ...classes: string[]): HTMLElementTagNameMap[K] => {
    const created = document.createElement(tag)
    if(classes.length > 0) created.classList.add(...classes)

    return created
}

let slideShowWindow: Window | null = null;

const element_slideBox = document.querySelector<HTMLUListElement>("#slide-box")

const sendToPopup = (data: any) => {
  if (slideShowWindow && !slideShowWindow.closed) {
    slideShowWindow.postMessage(data, window.location.origin);
  }
}

const openShow = () => {
  if(slideShowWindow) slideShowWindow.close()

  slideShowWindow = window.open('slide_show.html', 'MyPopup', 'width=500,height=600')
}

let titleFontSize = '5.5'
let textFontSize = '4.5'

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

        const result = await EditorPopup.show({...context, id: id, textIdx: idx}, songSetting.imgUrls)

        if(result) songSetting.modifySong(result)

        updateSong()
      })

      created_slide_li.appendChild(slide)
    })

    element_slideBox?.appendChild(created_slide_li)
    
  })

  sendToPopup({type: 'CHANGE', data: songSetting.currentContext})
}

const resizeTitle = (pixel: string) => {
  titleFontSize = pixel
  sendToPopup({type: "RESIZE_TITLE", data: pixel})
}

const resizeText = (pixel: string) => {
  textFontSize = pixel
  sendToPopup({type: "RESIZE_TEXT", data: pixel})
}

addFooterButton('파일추가', 'imgs/footer_icons/add_file.svg',
  async () => {
    const result = await FileAdderPopup.show()

    if(result) await songSetting.loadFiles(result)

    sendToPopup({type: 'UPDATE_BACKGROUND', data: songSetting.imgUrls})

    updateSong()
  })

addFooterButton('파일관리', 'imgs/footer_icons/manage_file.svg',
  async () => {
    const aboutJsonFile: Record<string, string> = {}
    Object.entries(songSetting.jsonFiles).forEach(([fileName, data]) => {
      aboutJsonFile[fileName] = `${data.map(d => d.title).join(', ')}`
    })
    
    const result = await FileManagerPopup.show(aboutJsonFile, songSetting.imgUrls)
    if(result) songSetting.manageFile(Object.keys(result.jsonCandidates), Object.keys(result.imgCandidates));

    updateSong()
  })

addFooterButton('순서수정', 'imgs/footer_icons/resort_slides.svg', 
  async () => {
  
    const result = await SlideSorterPopup.show(songSetting.order, songSetting.songs)
    if(result) songSetting.resortOrder(result)

    updateSong()
  })

addFooterButton('추가하기', 'imgs/footer_icons/add_slide.svg', 
  async () => {

    if(songSetting.isEmpty()) { // 아무 노래도 없으면 그냥 노래 하나 추가
      songSetting.insertNewSongBeforeCurrent()
      updateSong()
      return
    }

    const result = await SlideAddingOptionSetterPopup.show()

    switch (result) {
      case 'INSERT_LYRICS_BEFORE':
        songSetting.insertNewTextBeforeCurrent()
        break
      case 'INSERT_LYRICS_AFTER':
        songSetting.insertNewTextAfterCurrent()
        break
      case 'INSERT_SONG_BEFORE':
        songSetting.insertNewSongBeforeCurrent()
        break
      case 'INSERT_SONG_AFTER':
        songSetting.insertNewSongAfterCurrent()
        break
    }

    updateSong()
  })

addFooterButton('삭제하기', 'imgs/footer_icons/delete_slide.svg', 
  async () => {
    if(songSetting.isEmpty()) return // 아무 노래도 없으면 삭제 x

    const result = await SlideDeletingOptionSetterPopup.show()
    switch(result) {
      case "ALL":
        songSetting.deleteCurrentSong()
        break
      case "SELECTED_ONLY":
        songSetting.deleteCurrentText()
        break
    }

    updateSong()
  })

addFooterButton('내보내기', 'imgs/footer_icons/export_slides.svg',
  async () => {

    const downloadUrl = await songSetting.getExportLink()

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'settings'
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)

  })

addFooterButton('전체화면', 'imgs/footer_icons/open_viewer.svg',
  () => {
    openShow()
  })

addFooterButton('설정변경', 'imgs/footer_icons/edit_setting.svg', 
  () => {
    SettingEditorPopup.show(titleFontSize, textFontSize, resizeTitle, resizeText)
  })

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

      sendToPopup({type: 'RESIZE_TITLE', data: titleFontSize})
      sendToPopup({type: 'RESIZE_TEXT', data: textFontSize})
      sendToPopup({type: 'CHANGE', data: songSetting.currentContext})
      break
  }

});