import type { SongContext } from './main'

export const $createDiv = (text: string, ...classes: string[]) => {
    const element_div: HTMLDivElement = document.createElement('div')
    element_div.textContent = text
    element_div.classList.add(...classes)

    return element_div
}

export class Slide {

    private element_frame: HTMLDivElement = $createDiv('', 'slide-frame', 'small-box')

    constructor(context: SongContext, isSelected: boolean) {

        if(isSelected) this.element_frame.classList.add('selected')

        const created_slideLayerContainer = $createDiv('', 'slide-layer-container')

        const created_slideLayer = $createDiv('', 'slide-layer', 'visible')
        created_slideLayer.style.backgroundImage = `url(${context.background})`
        created_slideLayerContainer.appendChild(created_slideLayer)

        const created_slideTitle = $createDiv(context.title, 'slide-title')
        created_slideTitle.style.color = context.titleColor
        created_slideTitle.style.webkitTextStroke = `1px ${context.titleStroke}`
        created_slideTitle.style.textShadow = `3px 3px 0 ${context.titleShadow}`


        const created_slideText = $createDiv(context.text, 'slide-text')
        created_slideText.style.color = context.textColor
        created_slideText.style.webkitTextStroke = `1px ${context.textStroke}`
        created_slideText.style.textShadow = `2px 2px 0 ${context.textShadow}`


        this.element_frame.replaceChildren(
            created_slideLayerContainer, created_slideTitle, created_slideText
        )
    }

    render(): HTMLDivElement {
        return this.element_frame
    }

}
