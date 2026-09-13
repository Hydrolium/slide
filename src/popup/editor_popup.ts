import { $create, $createDiv } from "../main"
import type { ModifiedSongData } from "../song_settingt"
import { PopupGenerator } from "./popup"

interface SplitedColor {
    readonly color: string
    readonly opacityPercent: string
}

interface ModifiableSongData {
    readonly id: number
    title: string
    text: string
    readonly textIdx: number
    background: string
    titleColor: string
    titleStroke: string
    titleShadow: string
    textColor: string
    textStroke: string
    textShadow: string
}


export class EditorPopup extends PopupGenerator<ModifiedSongData> {

    private songData: ModifiableSongData

    constructor(songData: ModifiedSongData) {
        super()
        this.songData = {...songData}
    }

    private static createColorInput(color: string): HTMLInputElement {
        const created_input = $create('input')
        created_input.type = 'color'
        created_input.value = color
        return created_input
    }

    private static  createRangeInput(value: string, min: string = '0', max: string = '100', step: string = '1'): HTMLInputElement {
        const created_rangeInput = $create('input')
        created_rangeInput.type = 'range'
        created_rangeInput.value = value
        created_rangeInput.min = min
        created_rangeInput.max = max
        created_rangeInput.step = step

        return created_rangeInput
    }

    private static createNumberInput(value: string, min: string = '0', max: string = '100', step: string = '1'): HTMLInputElement {
        const created_numberInput = $create('input')
        created_numberInput.type = 'number'
        created_numberInput.value = value
        created_numberInput.min = min
        created_numberInput.max = max
        created_numberInput.step = step

        return created_numberInput
    }

    private static createTextInput(value: string): HTMLInputElement {
        const created_textInput = $create('input')
        created_textInput.type = 'text'
        created_textInput.value = value

        return created_textInput
    }

    private static createTextArea(value: string, rows=4, cols=10): HTMLTextAreaElement {
        const created_textarea = $create('textarea')
        created_textarea.value = value
        created_textarea.rows = rows
        created_textarea.cols = cols

        return created_textarea
    }

    private static createColorInputItem(label: string, color: string, onchange: (color: string) => void): HTMLDivElement {
        const created_inputEditor = $create('div', 'input-editor')

        created_inputEditor.appendChild($createDiv(label, 'input-editor-label'))

        const created_input = created_inputEditor.appendChild(this.createColorInput(color))
        created_input.onchange = () => onchange(created_input.value)

        onchange(color) // 최초 1회 실행해서 색상 초기화
        
        return created_inputEditor
    }

    private static percentToHex(percent: string = '1'): string {
        return Math.round(((100 - Number(percent)) / 100 ) * 255).toString(16).padStart(2, '0')
    }

    private static hexToPercent(hex: string): string {
        return Math.round(100 - (parseInt(hex, 16) / 255) * 100).toString()
    }


    private static withOpacity(color: string, opacityPercent: string): string {
        return `${color}${this.percentToHex(opacityPercent)}`
    }

    private static splitHex(hex: string): SplitedColor {

        if(!hex.startsWith('#')) // hex code 형식이 아님.
            return {color: '#000', opacityPercent: '100'}

        switch(hex.length) {
            case 4: // # X X X
                return {color: '#' + Array.from(hex.slice(1)).map(v => v.repeat(2)).join(), opacityPercent: '0'}
            case 5: // # X X X X
                return {color: '#' + Array.from(hex.slice(1, -1)).map(v => v.repeat(2)).join(), opacityPercent: this.hexToPercent(hex[4].repeat(2))}
            case 7: // # XX XX XX
                return {color: hex, opacityPercent: '0'}
            case 9: // # XX XX XX XX
                return {color: hex.slice(0, -2), opacityPercent: this.hexToPercent(hex.slice(-2))}

        }

        return {color: '#000', opacityPercent: '100'} // 기본값(완전 투명)

    }

    private static createColorWithOpacityInputItem(label: string, color: string, onchange: (color: string) => void): DocumentFragment {
        
        const splitedColor = this.splitHex(color)

        const created_container = document.createDocumentFragment()
        
        const created_colorInputEditor = created_container.appendChild($create('div', 'input-editor'))

        created_colorInputEditor.appendChild($createDiv(label + ' 색상', 'input-editor-label'))

        const created_colorInput = created_colorInputEditor.appendChild(this.createColorInput(splitedColor.color))

        const created_opacityInputEditor = created_container.appendChild($create('div', 'input-editor'))

        created_opacityInputEditor.appendChild(
            $createDiv(label + ' 투명도', 'input-editor-label')
        )

        const created_rangeInput = created_opacityInputEditor.appendChild(this.createRangeInput(splitedColor.opacityPercent))
        const created_numberInput = created_opacityInputEditor.appendChild(this.createNumberInput(splitedColor.opacityPercent))

        created_colorInput.onchange = () =>
            onchange(
                this.withOpacity(created_colorInput.value, created_rangeInput.value))


        created_rangeInput.onchange = () => {
            created_numberInput.value = created_rangeInput.value
            onchange(
                this.withOpacity(created_colorInput.value, created_rangeInput.value))
        }
        
        created_numberInput.onchange = () => {
            created_rangeInput.value = created_numberInput.value
            onchange(
                this.withOpacity(created_colorInput.value, created_rangeInput.value))
        }

        onchange(color) // 최초 1회 실행해서 색상 초기화

        return created_container
    }

    private static createdColorEditorBox(
        color: string,
        onColorChange: (color: string) => void,
        strokeColor: string,
        onStrokeColorChange: (color: string) => void,
        shadowColor: string,
        onShadowColorChange: (color: string) => void): HTMLDivElement {

        const created_colorEditorBox = $create('div', 'input-editors')

        created_colorEditorBox.append(
            this.createColorInputItem('글씨 색상', color, onColorChange),
            this.createColorInputItem('운곽선 색상', strokeColor, onStrokeColorChange),
            this.createColorWithOpacityInputItem('그림자', shadowColor, onShadowColorChange))

        return created_colorEditorBox
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: ModifiedSongData | null) => void): void {

        const created_editorInputsBox = element_popup.appendChild($create('div', 'editor-inputs-box'))

        const created_textInputs = $create('div', 'text-inputs')
        created_textInputs.style.backgroundImage = `url(${this.songData.background})`

        const created_titleInput = created_textInputs.appendChild(EditorPopup.createTextInput(''))
        created_titleInput.value = this.songData.title
        created_titleInput.onchange = () => this.songData.title = created_titleInput.value

        const created_textArea = created_textInputs.appendChild(EditorPopup.createTextArea(''))
        created_textArea.value = this.songData.text
        created_textArea.onchange = () => this.songData.text = created_textArea.value

        created_editorInputsBox.append(
            EditorPopup.createdColorEditorBox(
                this.songData.titleColor,
                color => {
                    created_titleInput.style.color = color
                    this.songData.titleColor = color
                },
                this.songData.titleStroke,
                color => {
                    created_titleInput.style.webkitTextStroke = `2px ${color}`
                    this.songData.titleStroke = color
                },
                this.songData.titleShadow,
                color => {
                    created_titleInput.style.textShadow = `3.5px 3.5px 0 ${color}`
                    this.songData.titleShadow = color
                }
            ),
            created_textInputs,
            EditorPopup.createdColorEditorBox(
                this.songData.textColor,
                color => {
                    created_textArea.style.color = color
                    this.songData.textColor = color
                },
                this.songData.textStroke,
                color => {
                    created_textArea.style.webkitTextStroke = `2px ${color}`
                    this.songData.textStroke = color
                },
                this.songData.textShadow,
                color => {
                    created_textArea.style.textShadow = `3.5px 3.5px 0 ${color}`
                    this.songData.textShadow = color
                }
            )
        )

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

        this.addPositiveButton('저장', () => {
            resolve({...this.songData})
        })

    }
}
