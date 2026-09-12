import type { ModifiedSongData } from "../song_settingt"

interface Editor {
    editor: HTMLInputElement | null
    colorEditor: HTMLInputElement | null
    strokeColorEditor: HTMLInputElement | null
    shadowColorEditor: HTMLInputElement | null
    shadowOpacityEditor: HTMLInputElement | null
    shadowOpacityLabelEditor: HTMLInputElement | null
}

const element_popupContainer = document.querySelector<HTMLDivElement>('#popup-container')

const element_titleEditor: Editor = {
    editor: document.querySelector<HTMLInputElement>('#title-editor'),
    colorEditor: document.querySelector<HTMLInputElement>('#title-color-editor'),
    strokeColorEditor: document.querySelector<HTMLInputElement>('#title-stroke-color-editor'),
    shadowColorEditor: document.querySelector<HTMLInputElement>('#title-shadow-color-editor'),
    shadowOpacityEditor: document.querySelector<HTMLInputElement>('#title-shadow-opacity-editor'),
    shadowOpacityLabelEditor: document.querySelector<HTMLInputElement>('#title-shadow-opacity-label-editor')
}

const element_textEditors = document.querySelector<HTMLDivElement>("#text-editors")

const element_textEditor: Editor = {
    editor: document.querySelector<HTMLInputElement>('#text-editor'),
    colorEditor: document.querySelector<HTMLInputElement>('#text-color-editor'),
    strokeColorEditor: document.querySelector<HTMLInputElement>('#text-stroke-color-editor'),
    shadowColorEditor: document.querySelector<HTMLInputElement>('#text-shadow-color-editor'),
    shadowOpacityEditor: document.querySelector<HTMLInputElement>('#text-shadow-opacity-editor'),
    shadowOpacityLabelEditor: document.querySelector<HTMLInputElement>('#text-shadow-opacity-label-editor')
}
const element_cancelPopupButton = document.querySelector<HTMLButtonElement>('#cancel-popup')
const element_savePopupButton = document.querySelector<HTMLButtonElement>('#save-popup')

const setValue = (target: HTMLInputElement | null, value: string | undefined) => {
    if(target) target.value = value || ""
}

const percentToHex = (percent: string = '1') => Math.round((100 - Number(percent)) * 2.55).toString(16).padStart(2, '0')
const hexToPercent = (hex: string) => `${Math.round(100 - parseInt(hex, 16) / 255 * 100)}`

const changeColor = (editor: Editor) => {
    if(editor.editor) editor.editor.style.color = editor.colorEditor?.value || ''
}

const changeStrokeColor = (editor: Editor) => {
    if(editor.editor) editor.editor.style.webkitTextStroke = `2px ${editor.strokeColorEditor?.value || ''}`
}

const getShadowColor = (editor: Editor) => {
    if(!editor.shadowColorEditor?.value || !editor.shadowOpacityEditor?.value) return

    return `${editor.shadowColorEditor.value}${percentToHex(editor.shadowOpacityEditor.value)}`
}

const changeShadowColor = (editor: Editor) => {
    if(editor.editor) editor.editor.style.textShadow = `3.5px 3.5px 0 ${getShadowColor(editor) || '#0000'}`
}

;[element_titleEditor, element_textEditor].forEach(editor => {

    editor.colorEditor?.addEventListener('change', () => changeColor(editor))

    editor.strokeColorEditor?.addEventListener('change', () => changeStrokeColor(editor))

    editor.shadowColorEditor?.addEventListener('change', () => changeShadowColor(editor))

    editor.shadowOpacityEditor?.addEventListener('change', () => {
        setValue(editor.shadowOpacityLabelEditor, editor.shadowOpacityEditor?.value)
        changeShadowColor(editor)
    })

    editor.shadowOpacityLabelEditor?.addEventListener('change', () => {
        setValue(editor.shadowOpacityEditor, editor.shadowOpacityLabelEditor?.value)
        changeShadowColor(editor)
    })
})


export const openEditorPopup = (songData: ModifiedSongData) => {
    
    if(!element_popupContainer || !element_titleEditor || !element_textEditor || !element_savePopupButton || !element_cancelPopupButton) return

    setValue(element_titleEditor.editor, songData.title)
    setValue(element_titleEditor.colorEditor, songData.titleColor)
    setValue(element_titleEditor.strokeColorEditor, songData.titleStroke)
    setValue(element_titleEditor.shadowColorEditor, songData.titleShadow.slice(0, -2))

    const titleOpacity = hexToPercent(songData.titleShadow.slice(-2))
    setValue(element_titleEditor.shadowOpacityEditor, titleOpacity)
    setValue(element_titleEditor.shadowOpacityLabelEditor, titleOpacity)

    changeColor(element_titleEditor)
    changeStrokeColor(element_titleEditor)
    changeShadowColor(element_titleEditor)

    setValue(element_textEditor.editor, songData.text)
    setValue(element_textEditor.colorEditor, songData.textColor)
    setValue(element_textEditor.strokeColorEditor, songData.textStroke)
    setValue(element_textEditor.shadowColorEditor, songData.textShadow.slice(0, -2))

    const textOpacity = hexToPercent(songData.textShadow.slice(-2))
    setValue(element_textEditor.shadowOpacityEditor, textOpacity)
    setValue(element_textEditor.shadowOpacityLabelEditor, textOpacity)

    changeColor(element_textEditor)
    changeStrokeColor(element_textEditor)
    changeShadowColor(element_textEditor)

    if(element_textEditors) element_textEditors.style.backgroundImage = `url(${songData.background})`

    element_popupContainer.style.display = 'block'

    return new Promise<ModifiedSongData | null>((resolve) => {
        element_cancelPopupButton.onclick = () => {
            if(element_popupContainer) element_popupContainer.style.display = 'none'

            element_cancelPopupButton.onclick = null
            element_savePopupButton.oncancel = null

            resolve(null)
        }
        element_savePopupButton.onclick = () => {

            element_popupContainer.style.display = 'none'

            element_cancelPopupButton.onclick = null
            element_savePopupButton.onclick = null

            resolve({
                id: songData.id, 
                title: element_titleEditor.editor?.value || "ERROR",
                text: element_textEditor.editor?.value || "ERROR",
                textIdx: songData.textIdx,
                background: songData.background,
                titleColor: element_titleEditor.colorEditor?.value || songData.title,
                titleStroke: element_titleEditor.strokeColorEditor?.value || songData.titleStroke,
                titleShadow: getShadowColor(element_titleEditor) || songData.titleShadow,
                textColor: element_textEditor.colorEditor?.value || songData.textColor,
                textStroke: element_textEditor.strokeColorEditor?.value || songData.textStroke,
                textShadow: getShadowColor(element_textEditor) || songData.textShadow
            })
        }
    })


}