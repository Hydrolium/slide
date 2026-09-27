import { $create, $createDiv } from "../main"
import type { ImageInfo, ManagementResult } from "../song_settingt"
import { PopupGenerator } from "./popup"
import { FileDeletingOptionSetterPopup } from "./select_file_deleting_option_popup"

import '../style/popup/file_resetter.css'


export class FileManagerPopup extends PopupGenerator<ManagementResult> {

    readonly jsonFiles: Readonly<Record<string, string>>
    readonly imgFiles: Readonly<Record<string, ImageInfo>>

    private readonly managementResult: ManagementResult = {removedImgs: [], removedJsons: {}, refreshedJsons: new Set()}
    
    constructor(jsonCandidates: Record<string, string>, imgCandidates: Record<string, ImageInfo>) {
        super()

        this.jsonFiles = {...jsonCandidates}
        this.imgFiles = {...imgCandidates}
    }

    private createJsonFileItem(element_existingFileList: HTMLUListElement, fileName: string, detail: string): HTMLLIElement {
        const created_fileItem = $create('li', 'file-item')

        const created_buttonBox = created_fileItem.appendChild($create('div', 'file-button-box'))

        const created_removeButton = created_buttonBox.appendChild($create('button', 'remove-file-button'))

        created_removeButton.addEventListener('click', async () => {
            
            const result = await FileDeletingOptionSetterPopup.show()
            if(!result) return
            this.managementResult.removedJsons[fileName] = result
            element_existingFileList?.removeChild(created_fileItem)
        })

        const created_refreshLabel = created_buttonBox.appendChild($create('label', 'refresh-file-label'))

        const created_refreshCheckbox = created_refreshLabel.appendChild($create('input', 'refresh-file-checkbox'))

        created_refreshCheckbox.id = 'refresh-json-file-checkbox'
        created_refreshCheckbox.type = 'checkbox'
        created_refreshCheckbox.addEventListener('change', (e: Event) => {
            if((e.target as HTMLInputElement).checked) this.managementResult.refreshedJsons.add(fileName)
            else this.managementResult.refreshedJsons.delete(fileName)
        })
       

        created_fileItem.appendChild(
            $createDiv(fileName, 'file-item-text')
        )

        created_fileItem.appendChild(
            $createDiv(detail, 'file-item-detail')
        )

        return created_fileItem
    }

    private createImgFileItem(element_existingFileList: HTMLUListElement, fileName: string, imgUrl: string): HTMLLIElement {
        const created_fileItem = $create('li', 'file-item')

        const created_removeButton = $create('button', 'remove-file-button')
        created_fileItem.appendChild(created_removeButton)

        created_removeButton.addEventListener('click', () => {
            this.managementResult.removedImgs.push(fileName)
            element_existingFileList?.removeChild(created_fileItem)
        })

        const created_img = created_fileItem.appendChild($create('img', 'file-item-img'))
        created_img.src = imgUrl

        created_fileItem.appendChild(
            $createDiv(fileName, 'file-item-text')
        )

        return created_fileItem
    }

    private renderFileList(element_existingFileList: HTMLUListElement): void {
        element_existingFileList?.replaceChildren()

        Object.entries(this.imgFiles).forEach(([name, info]) => {
            element_existingFileList?.appendChild(
                this.createImgFileItem(element_existingFileList, name, info.url)
            )
        })

        Object.entries(this.jsonFiles).forEach(([name, detail]) => {
            element_existingFileList?.appendChild(
                this.createJsonFileItem(element_existingFileList,name, `(${detail})`)
            )
        })
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: ManagementResult | null) => void): void {

        const created_existingFileList = $create('ul', 'file-list')
        element_popup.appendChild(created_existingFileList)
        
        const created_tip = $createDiv('json 파일 새로고침 시 파일 내 모든 노래 슬라이드가 삭제 후 다시 추가됩니다.', 'tip')
        element_popup.appendChild(created_tip)

        this.renderFileList(created_existingFileList)

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

        this.addPositiveButton('저장', () => {
            resolve(structuredClone(this.managementResult))
        })

    }
}