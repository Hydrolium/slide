import { $create } from "../main";
import '../style/popup.css'

const element_app = document.querySelector<HTMLDivElement>('#app')

export abstract class PopupGenerator<T> {
    
    private created_popupContainer: HTMLDivElement | null = null
    private buttonList: HTMLButtonElement[] = []

    protected abstract draw(element_popup: HTMLDivElement, resolve: (value: T | null) => void): void

    protected addNegativeButton(text: string, onclick: (e: Event) => void): void {
        const created_button = $create('button', 'cancel-popup')
        created_button.textContent = text
        created_button.onclick = onclick
        this.buttonList.push(created_button)
    }

    protected addPositiveButton(text: string, onclick: (e: Event) => void): void {
        const created_button = $create('button', 'save-popup')
        created_button.textContent = text
        created_button.onclick = onclick
        this.buttonList.push(created_button)
    }

    public run(): Promise<T | null> {
        
        return new Promise<T | null>((resolve) => {
            this.buttonList = []

            this.created_popupContainer = $create('div', 'popup-container')
            const created_popup = $create('div', 'popup')
            
            this.draw(created_popup, (value: T | null) => {
                this.hide();
                resolve(value)
            })

            if(this.buttonList.length > 0) {
                const created_popupButtonBox = $create('div', 'popup-button-box')
                created_popupButtonBox.replaceChildren(...this.buttonList)
                created_popup.appendChild(created_popupButtonBox)
            }

            this.created_popupContainer.appendChild(created_popup)

            element_app?.appendChild(
                this.created_popupContainer
            )

        })
    }

    private hide(): void {
        if(this.created_popupContainer) {
            this.created_popupContainer.remove()
            this.created_popupContainer = null
        }
    }
}