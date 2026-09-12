import { $create, $createDiv } from "../main"
import type { SongInfo } from "../song_settingt"

const element_sortPopupContainer = document.querySelector<HTMLDivElement>('#sort-popup-container')
const element_sortSlideBox = document.querySelector<HTMLUListElement>('#sort-slide-box')

const element_cancelSortPopup = document.querySelector<HTMLButtonElement>('#cancel-sort-popup')
const element_saveSortPopup = document.querySelector<HTMLButtonElement>('#save-sort-popup')

let idList: number[] = []
let infoMap: Record<number, SongInfo> = {}



const moveUp = (targetId: number) => {
    const targetIdx = idList.indexOf(targetId)
    if(targetIdx <= 0) return

    [idList[targetIdx], idList[targetIdx - 1]] = [idList[targetIdx - 1], idList[targetIdx]]

    render()
}

const moveDown = (targetId: number) => {
    const targetIdx = idList.indexOf(targetId)
    if(targetIdx == -1 || targetIdx >= idList.length - 1) return

    [idList[targetIdx], idList[targetIdx + 1]] = [idList[targetIdx + 1], idList[targetIdx]]

    render()
}

const createItem = (id: number) => {
    const created_li = $create('li', 'sort-item')

    const created_buttonBox = $create('div', "sort-up-down-buttons")


    const created_upButton = $create('button', 'sort-up-button')
    created_upButton.addEventListener('click', () => {
        moveUp(id)
    })
    created_buttonBox.appendChild(created_upButton)

    const created_downButton = $create('button', 'sort-down-button')
    created_downButton.addEventListener('click', () => {
        moveDown(id)
    })
    created_buttonBox.appendChild(created_downButton)

    const created_removeButton = $create('button', 'sort-remove-button')
    created_removeButton.addEventListener('click', () => {
        idList = idList.filter(i => i != id)
        render()
    }
        
    )
    created_buttonBox.appendChild(created_removeButton)

    created_li.appendChild(created_buttonBox)

    created_li.appendChild($createDiv(infoMap[id].title, 'sort-item-text'))

    return created_li
}

const render = () => {
    element_sortSlideBox?.replaceChildren(
        ...idList.map(createItem)
    )
}

export const openSortPopup = (orderedIds: number[], idToInfo: Record<number, SongInfo>) => {
    idList = [...orderedIds]
    infoMap = idToInfo

    render()

    if(element_sortPopupContainer)
        element_sortPopupContainer.style.display = 'block'

    return new Promise<number[] | null>((resolve) => {
        if(element_cancelSortPopup && element_saveSortPopup) {
            element_cancelSortPopup.onclick = () => {
                closePopup()

                element_cancelSortPopup.onclick = null
                element_saveSortPopup.onclick = null

                resolve(null)
            }
            element_saveSortPopup.onclick = () => {
                
                closePopup()
                
                element_cancelSortPopup.onclick = null
                element_saveSortPopup.onclick = null

                resolve(idList)
            }
        }
    })

}

export const closePopup = () => {

    if(element_sortPopupContainer)
        element_sortPopupContainer.style.display = 'none'

    element_sortSlideBox?.replaceChildren()
}