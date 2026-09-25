import { $create, $createDiv } from "../main"
import { PopupGenerator } from "./popup"

import '../style/popup/setting_editor.css'

export class SettingEditorPopup extends PopupGenerator<null> {

    private readonly initialTitleFontSize: string
    private readonly initialTextFontSize: string
    private readonly titleSizeController: (size: string) => void
    private readonly textSizeController: (size: string) => void

    constructor(titleFontSize: string, textFontSize: string, titleSizeController: (size: string) => void, textSizeController: (size: string) => void) {
        super()

        this.initialTitleFontSize = titleFontSize
        this.initialTextFontSize = textFontSize
        this.titleSizeController = titleSizeController
        this.textSizeController = textSizeController
        
    }

    private createdNumberInputSettingItem(label: string, initialValue: string, onchange: (e: Event) => void): HTMLLIElement {
        const created_settingItem = $create('li', 'setting-item')

        created_settingItem.appendChild(
            $createDiv(label, 'setting-label')
        )

        const created_input = $create('input', 'setting-input')
        created_input.type = 'number'
        created_input.value = initialValue
        created_input.onchange = onchange

        created_settingItem.appendChild(created_input)

        return created_settingItem
    }
 
    protected draw(element_popup: HTMLDivElement, resolve: (value: null) => void): void {

        const created_settingList = $create('ul', 'setting-list')

        created_settingList.appendChild(
            this.createdNumberInputSettingItem(
                '타이틀 크기',
                this.initialTitleFontSize,
                (e: Event) => {
                    if(e.target instanceof HTMLInputElement)
                        this.titleSizeController(e.target.value)}))

        created_settingList.appendChild(
            this.createdNumberInputSettingItem(
                '텍스트 크기',
                this.initialTextFontSize,
                (e: Event) => {
                    if(e.target instanceof HTMLInputElement)
                        this.textSizeController(e.target.value)}))

        element_popup.appendChild(created_settingList)

        this.addNegativeButton('닫기', () => {
            resolve(null)
        })

    }
}
