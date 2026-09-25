import { $create, $createDiv } from "./main"

import './style/footer.css'

const element_footer = document.querySelector<HTMLDivElement>('#footer')

const createFooterButton = (label: string, svgSrc: string,  onclick: (e: Event) => void) => {
    const created_menuButton = $create('div', 'menu-button')

    const created_button = $create('button')
    // created_button.style.backgroundImage = `url(${svgSrc})`

    const created_iconBackground = $create('span', 'icon-background')

    created_iconBackground.style.webkitMaskImage = `url(${svgSrc})`
    created_iconBackground.style.maskImage = `url(${svgSrc})`
    created_button.appendChild(created_iconBackground)
    created_menuButton.appendChild(created_button)

    created_menuButton.appendChild($createDiv(label))

    created_menuButton.onclick = onclick

    return created_menuButton    
}

export const addFooterButton = (label: string, svgSrc: string,  onclick: (e: Event) => void) => {
    element_footer?.appendChild(
        createFooterButton(label, svgSrc, onclick)
    )
}