import { $create, $createDiv } from "../main"
import { PopupGenerator } from "./popup"

import '../style/popup/file_resetter.css'

export class FileAdderPopup extends PopupGenerator<File[]> {

    private candidates: File[] = []

    private addDragDropEvent(element_dropFileBox: HTMLDivElement, element_fileList: HTMLUListElement): void {
        ;['dragenter', 'dragover', 'dragleave', 'drop']
        .forEach((eventName) => {
            element_dropFileBox?.addEventListener(eventName, (e: Event) => {
                e.preventDefault()
                e.stopPropagation()
            })
        })

        element_dropFileBox?.addEventListener('dragover', () => {
            element_dropFileBox?.classList.add('dragover')
        })

        ;['dragleave', 'drop']
        .forEach((eventName) => {
            element_dropFileBox?.addEventListener(eventName, () => {
                element_dropFileBox?.classList.remove('dragover');
            })
        })

        element_dropFileBox?.addEventListener('drop', (e: DragEvent) => {
            const files = e.dataTransfer?.files

            if(files) [...files].forEach(f => {
                if(f.type.includes('json') || f.type.startsWith('image/'))
                    this.candidates.push(f)})

            this.renderFileList(element_fileList)
        })
    }

    private createFileItem(fileName: string, element_fileList: HTMLUListElement): HTMLLIElement {
        const created_fileItem = $create('li', 'file-item')

        const created_removeButton = $create('button', 'remove-file-button')
        created_fileItem.appendChild(created_removeButton)

        created_removeButton.addEventListener('click', () => {
            this.candidates = this.candidates.filter(f => f.name != fileName)
            this.renderFileList(element_fileList)
        })

        created_fileItem.appendChild(
            $createDiv(fileName, 'file-item-text')
        )

        return created_fileItem
    }

    private renderFileList(element_fileList: HTMLUListElement): void {
        element_fileList.replaceChildren()

        this.candidates.forEach(file =>
            element_fileList.appendChild(
                this.createFileItem(file.name, element_fileList)))
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: File[] | null) => void): void {
        const created_dropFileBox = $create('div', 'drop-file-box')
        
        const created_dropFileText = $createDiv('파일을 드래그하여 추가하세요', 'drop-file-text')
        created_dropFileBox.appendChild(created_dropFileText)
        
        const created_addedFileList = $create('ul', 'file-list')

        this.addDragDropEvent(created_dropFileBox, created_addedFileList)

        element_popup.appendChild(created_dropFileBox)
        element_popup.appendChild(created_addedFileList)

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

        this.addPositiveButton('저장', () => {
            resolve(this.candidates)
        })

    }
}