import { resort_order } from "./main"
import { $createDiv } from "./slide"

const element_sortPopupContainer = document.querySelector<HTMLDivElement>('#sort-popup-container')
const element_sortSlideBox = document.querySelector<HTMLUListElement>('#sort-slide-box')

const element_cancelSortPopup = document.querySelector<HTMLButtonElement>('#cancel-sort-popup')
const element_saveSortPopup = document.querySelector<HTMLButtonElement>('#save-sort-popup')

let title_list: string[] = []

export const $create = (tag: string, ...classes: string[]) => {
    const element_div = document.createElement(tag)
    element_div.classList.add(...classes)

    return element_div
}

const moveUp = (targetTitle: string) => {
    const targetIdx = title_list.indexOf(targetTitle)
    if(targetIdx <= 0) return

    [title_list[targetIdx], title_list[targetIdx - 1]] = [title_list[targetIdx - 1], title_list[targetIdx]]

    render()
}

const moveDown = (targetTitle: string) => {
    const targetIdx = title_list.indexOf(targetTitle)
    if(targetIdx == -1 || targetIdx >= title_list.length - 1) return

    [title_list[targetIdx], title_list[targetIdx + 1]] = [title_list[targetIdx + 1], title_list[targetIdx]]

    render()
}

const createItem = (title: string) => {
    const created_li = $create('li', 'sort-item')

    const created_buttonBox = $create('div', "sort-up-down-buttons")


    const created_upButton = $create('button', 'sort-up-button')
    created_upButton.addEventListener('click', () => {
        moveUp(title)
    })
    created_buttonBox.appendChild(created_upButton)

    const created_downButton = $create('button', 'sort-down-button')
    created_downButton.addEventListener('click', () => {
        moveDown(title)
    })
    created_buttonBox.appendChild(created_downButton)

    const created_removeButton = $create('button', 'sort-remove-button')
    created_removeButton.addEventListener('click', () => {
        title_list = title_list.filter(t => t != title)
        render()
    }
        
    )
    created_buttonBox.appendChild(created_removeButton)

    created_li.appendChild(created_buttonBox)

    created_li.appendChild($createDiv(title, 'sort-item-text'))

    return created_li
}

const render = () => {
    element_sortSlideBox?.replaceChildren(
        ...title_list.map(createItem)
    )
}

export const openSortPopup = (titles: string[]) => {
    title_list = [...titles]

    render()

    if(element_sortPopupContainer)
        element_sortPopupContainer.style.display = 'block'
}

export const closePopup = () => {

    if(element_sortPopupContainer)
        element_sortPopupContainer.style.display = 'none'

    title_list = []
    element_sortSlideBox?.replaceChildren()
}

element_cancelSortPopup?.addEventListener('click', () => {
    closePopup()
})

element_saveSortPopup?.addEventListener('click', () => {
    resort_order(title_list)
    closePopup()
})