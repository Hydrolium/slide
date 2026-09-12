import { resizeText, resizeTitle } from "./main"

const element_editSettingPoupContainer = document.querySelector<HTMLDivElement>("#edit-setting-popup-container")

const element_titleSizeInput = document.querySelector<HTMLInputElement>("#title-size")
const element_textSizeInput = document.querySelector<HTMLInputElement>("#text-size")

const element_closeSettingButton = document.querySelector<HTMLButtonElement>("#close-setting-popup")

export const openSettingPopup = (titleFontSize: string, textFontSize: string) => {
    if(!element_editSettingPoupContainer || !element_titleSizeInput || !element_textSizeInput) return

    element_editSettingPoupContainer.style.display = 'block'
    element_titleSizeInput.value = titleFontSize
    element_textSizeInput.value = textFontSize
}

element_closeSettingButton?.addEventListener('click', () => {
    if(element_editSettingPoupContainer)
        element_editSettingPoupContainer.style.display = 'none'
})

element_titleSizeInput?.addEventListener('change', () => {
    resizeTitle(element_titleSizeInput.value)
})

element_textSizeInput?.addEventListener('change', () => {
    resizeText(element_textSizeInput.value)
})