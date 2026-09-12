import { edit_setting, type SongContext } from './main'

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

element_cancelPopupButton?.addEventListener('click', () => {
    if(element_popupContainer) element_popupContainer.style.display = 'none'
    if(element_savePopupButton) element_savePopupButton.oncancel = null
})

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


export const openPopup = (context: SongContext, textIdx: number) => {

    if(!element_popupContainer || !element_titleEditor || !element_textEditor || !element_savePopupButton) return

    setValue(element_titleEditor.editor, context.title)
    setValue(element_titleEditor.colorEditor, context.titleColor)
    setValue(element_titleEditor.strokeColorEditor, context.titleStroke)
    setValue(element_titleEditor.shadowColorEditor, context.titleShadow.slice(0, -2))

    const titleOpacity = hexToPercent(context.titleShadow.slice(-2))
    setValue(element_titleEditor.shadowOpacityEditor, titleOpacity)
    setValue(element_titleEditor.shadowOpacityLabelEditor, titleOpacity)

    changeColor(element_titleEditor)
    changeStrokeColor(element_titleEditor)
    changeShadowColor(element_titleEditor)

    setValue(element_textEditor.editor, context.text)
    setValue(element_textEditor.colorEditor, context.textColor)
    setValue(element_textEditor.strokeColorEditor, context.textStroke)
    setValue(element_textEditor.shadowColorEditor, context.textShadow.slice(0, -2))

    const textOpacity = hexToPercent(context.textShadow.slice(-2))
    setValue(element_textEditor.shadowOpacityEditor, textOpacity)
    setValue(element_textEditor.shadowOpacityLabelEditor, textOpacity)

    changeColor(element_textEditor)
    changeStrokeColor(element_textEditor)
    changeShadowColor(element_textEditor)

    if(element_textEditors) element_textEditors.style.backgroundImage = `url(${context.background})`

    element_popupContainer.style.display = 'block'

    element_savePopupButton.onclick = () => {
        closePopup(context, textIdx)
        element_savePopupButton.onclick = null
    }
}

const closePopup = (context: SongContext, textIdx: number) => {
    if(!element_popupContainer || !element_titleEditor || !element_textEditor) return

    element_popupContainer.style.display = 'none'

    const newTitle = element_titleEditor.editor?.value || "ERROR"
    const newText = element_textEditor.editor?.value || "ERROR"

    edit_setting(
        context.title,
        textIdx,
        {   title: newTitle,
            text: newText,
            background: context.background,
            titleColor: element_titleEditor.colorEditor?.value || context.title,
            titleStroke: element_titleEditor.strokeColorEditor?.value || context.titleStroke,
            titleShadow: getShadowColor(element_titleEditor) || context.titleShadow,
            textColor: element_textEditor.colorEditor?.value || context.text,
            textStroke: element_textEditor.strokeColorEditor?.value || context.textStroke,
            textShadow: getShadowColor(element_textEditor) || context.textShadow
        })

}