const element_editSettingPoupContainer = document.querySelector<HTMLDivElement>("#edit-setting-popup-container")

const element_titleSizeInput = document.querySelector<HTMLInputElement>("#title-size")
const element_textSizeInput = document.querySelector<HTMLInputElement>("#text-size")

const element_closeSettingButton = document.querySelector<HTMLButtonElement>("#close-setting-popup")

export const openSettingPopup = (titleFontSize: string, textFontSize: string, titleSizeController: (size: string) => void, textSizeController: (size: string) => void) => {
    if(!element_editSettingPoupContainer || !element_titleSizeInput || !element_textSizeInput || !element_closeSettingButton) return

    element_editSettingPoupContainer.style.display = 'block'
    element_titleSizeInput.value = titleFontSize
    element_textSizeInput.value = textFontSize

    element_titleSizeInput.onchange = () => {
        titleSizeController(element_titleSizeInput.value)
    }

    element_textSizeInput.onchange = () => {
        textSizeController(element_textSizeInput.value)
    }

    return new Promise<null>((resolve) => {
        element_closeSettingButton.onclick = () => {
            element_editSettingPoupContainer.style.display = 'none'
            element_closeSettingButton.onclick = null
            resolve(null)
        }
    })
}

