import { $create, $createDiv } from "../main"
import type { ImageInfo } from "../song_settingt"

interface Candidates {
    readonly jsonCandidates: Record<string, string>
    readonly imgCandidates: Record<string, ImageInfo>
}

const element_fileManagePopupContainer = document.querySelector<HTMLDivElement>("#file-manage-popup-container")

const element_existingFileList = document.querySelector<HTMLUListElement>("#existing-file-list")

const element_cancelFileManagePopup = document.querySelector<HTMLButtonElement>("#cancel-file-manage-popup")
const element_saveFileManagePopup = document.querySelector<HTMLButtonElement>("#save-file-manage-popup")

let candidates: Candidates

const createJsonFileItem = (fileName: string, detail: string) => {
    const created_fileItem = $create('li', 'file-item')

    const created_removeButton = $create('button', 'remove-file-button')
    created_fileItem.appendChild(created_removeButton)

    created_removeButton.addEventListener('click', () => {
        delete candidates.jsonCandidates[fileName]
        element_existingFileList?.removeChild(created_fileItem)
    })

    created_fileItem.appendChild(
        $createDiv(fileName, 'file-item-text')
    )

    created_fileItem.appendChild(
        $createDiv(detail, 'file-item-detail')
    )

    return created_fileItem
}

const createImgFileItem = (fileName: string, imgUrl: string) => {
    const created_fileItem = $create('li', 'file-item')

    const created_removeButton = $create('button', 'remove-file-button')
    created_fileItem.appendChild(created_removeButton)

    created_removeButton.addEventListener('click', () => {
        delete candidates.imgCandidates[fileName]
        element_existingFileList?.removeChild(created_fileItem)
    })

    created_fileItem.appendChild(
        $createDiv(fileName, 'file-item-text')
    )

    const created_img = $create('img', 'file-item-img') as HTMLImageElement
    created_img.src = imgUrl
    created_fileItem.appendChild(created_img)

    return created_fileItem
}

const render = () => {
    element_existingFileList?.replaceChildren()
    
    Object.entries(candidates.imgCandidates).forEach(([name, info]) => {
        element_existingFileList?.appendChild(
            createImgFileItem(name, info.url)
        )
    })

    Object.entries(candidates.jsonCandidates).forEach(([name, detail]) => {
        element_existingFileList?.appendChild(
            createJsonFileItem(name, `(${detail})`)
        )
    })
}

export const openManageFilePopup = (jsonFile: Record<string, string>, imgFile: Record<string, ImageInfo>) => {
    if(element_fileManagePopupContainer)
        element_fileManagePopupContainer.style.display = 'block'

    candidates = {
        jsonCandidates: {...jsonFile},
        imgCandidates: {...imgFile}
    }

    render()

    return new Promise<Candidates | null>((resolve) => {
        if(element_cancelFileManagePopup && element_saveFileManagePopup) {
            element_cancelFileManagePopup.onclick = () => {
                closePopup()
                resolve(null)
            }
            element_saveFileManagePopup.onclick = () => {
                closePopup()
                resolve(candidates)
            }
        }
    })    
}

const closePopup = () => {
    if(element_fileManagePopupContainer)
        element_fileManagePopupContainer.style.display = 'none'
}