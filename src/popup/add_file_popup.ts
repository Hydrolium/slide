import { $create, $createDiv } from "../main"

const element_fileAddPopupContainer = document.querySelector<HTMLDivElement>("#file-adding-popup-container")
const element_dropFileBox = document.querySelector<HTMLButtonElement>("#drop-file-box")

const element_fileList = document.querySelector<HTMLUListElement>("#added-file-list")

const element_cancelFileAddPopup = document.querySelector<HTMLButtonElement>("#cancel-file-adding-popup")
const element_saveFileAddPopup = document.querySelector<HTMLButtonElement>("#save-file-adding-popup")

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

export const openAddFilePopup = () => {
    if(element_fileAddPopupContainer)
        element_fileAddPopupContainer.style.display = 'block'

    candidates = []

    render()

    return new Promise<File[] | null>((resolve) => {
        if(element_cancelFileAddPopup && element_saveFileAddPopup) {
            element_cancelFileAddPopup.onclick = () => {
                closePopup()
                resolve(null)
            }
            element_saveFileAddPopup.onclick = () => {
                closePopup()

                resolve(candidates)
            }
        }
    })    
}

const closePopup = () => {
    if(element_fileAddPopupContainer)
        element_fileAddPopupContainer.style.display = 'none'
}