import { loadFiles } from "./main";
import { $createDiv } from "./slide";
import { $create } from "./sort_popup";

const element_filePopupContainer = document.querySelector<HTMLDivElement>("#file-popup-container")
const element_dropFileBox = document.querySelector<HTMLButtonElement>("#drop-file-box")

// const element_fileBox = document.querySelector<HTMLDivElement>("#file-box")

const element_fileList = document.querySelector<HTMLUListElement>("#file-list")

const element_cancelFilePopup = document.querySelector<HTMLButtonElement>("#cancel-file-popup")
const element_saveFilePopup = document.querySelector<HTMLButtonElement>("#save-file-popup")

let candidates: File[] = []

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  element_dropFileBox?.addEventListener(eventName, (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
  })
})

element_dropFileBox?.addEventListener('dragover', () => {
    element_dropFileBox?.classList.add('dragover')
})

;['dragleave', 'drop'].forEach((eventName) => {
  element_dropFileBox?.addEventListener(eventName, () => {
    element_dropFileBox?.classList.remove('dragover');
  })
})

element_dropFileBox?.addEventListener('drop', (e: DragEvent) => {
  const files = e.dataTransfer?.files

  if(files) [...files].forEach(f => {
    if(f.type.includes('json') || f.type.startsWith('image/'))
        candidates.push(f)})

  render()
})

const createFileItem = (fileName: string) => {
    const created_fileItem = $create('li', 'file-item')

    const created_removeButton = $create('button', 'remove-file-button')
    created_fileItem.appendChild(created_removeButton)

    created_removeButton.addEventListener('click', () => {
        candidates = candidates.filter(f => f.name != fileName)
        render()
    })

    created_fileItem.appendChild(
        $createDiv(fileName, 'file-item-text')
    )

    return created_fileItem
}

const render = () => {
    element_fileList?.replaceChildren()

    candidates.forEach(file =>
        element_fileList?.appendChild(
            createFileItem(file.name)))

}

export const openManageFilePopup = () => {
    if(element_filePopupContainer)
        element_filePopupContainer.style.display = 'block'

    candidates = []

    render()
}

element_cancelFilePopup?.addEventListener('click', () => {
    if(element_filePopupContainer)
        element_filePopupContainer.style.display = 'none'
})

element_saveFilePopup?.addEventListener('click', () => {
    loadFiles(candidates)

    if(element_filePopupContainer)
        element_filePopupContainer.style.display = 'none'
})