import { $create, $createDiv } from "../main"
import type { ImageInfo } from "../song_settingt"
import { PopupGenerator } from "./popup"

import '../style/popup/file_resetter.css'

interface Candidates {
    readonly jsonCandidates: Record<string, string>
    readonly imgCandidates: Record<string, ImageInfo>
}

export class FileManagerPopup extends PopupGenerator<Candidates> {

    private candidates: Candidates
    
    constructor(jsonCandidates: Record<string, string>, imgCandidates: Record<string, ImageInfo>) {
        super()

        this.candidates = {jsonCandidates: {...jsonCandidates}, imgCandidates: {...imgCandidates}}
    }

    public createJsonFileItem(element_existingFileList: HTMLUListElement, fileName: string, detail: string): HTMLLIElement {
        const created_fileItem = $create('li', 'file-item')

        const created_removeButton = $create('button', 'remove-file-button')
        created_fileItem.appendChild(created_removeButton)

        created_removeButton.addEventListener('click', () => {
            delete this.candidates.jsonCandidates[fileName]
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

    public createImgFileItem(element_existingFileList: HTMLUListElement, fileName: string, imgUrl: string): HTMLLIElement {
        const created_fileItem = $create('li', 'file-item')

        const created_removeButton = $create('button', 'remove-file-button')
        created_fileItem.appendChild(created_removeButton)

        created_removeButton.addEventListener('click', () => {
            delete this.candidates.imgCandidates[fileName]
            element_existingFileList?.removeChild(created_fileItem)
        })

        created_fileItem.appendChild(
            $createDiv(fileName, 'file-item-text')
        )

        const created_img = $create('img', 'file-item-img')
        created_img.src = imgUrl
        created_fileItem.appendChild(created_img)

        return created_fileItem
    }

    private renderFileList(element_existingFileList: HTMLUListElement): void {
        element_existingFileList?.replaceChildren()

        Object.entries(this.candidates.imgCandidates).forEach(([name, info]) => {
            element_existingFileList?.appendChild(
                this.createImgFileItem(element_existingFileList, name, info.url)
            )
        })

        Object.entries(this.candidates.jsonCandidates).forEach(([name, detail]) => {
            element_existingFileList?.appendChild(
                this.createJsonFileItem(element_existingFileList,name, `(${detail})`)
            )
        })
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: Candidates | null) => void): void {

        const created_existingFileList = $create('ul', 'file-list')
        element_popup.appendChild(created_existingFileList)
        
        const created_tip = $createDiv('*저장 시 모든 변경사항이 초기화됩니다. 변경 내용은 메인화면의 [내보내기]로 저장하세요.', 'tip')
        element_popup.appendChild(created_tip)

        this.renderFileList(created_existingFileList)

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

        this.addPositiveButton('저장', () => {
            resolve(this.candidates)
        })

    }
}