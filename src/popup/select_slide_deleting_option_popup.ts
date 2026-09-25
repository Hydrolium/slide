import { $create, $createSpan } from "../main"
import { PopupGenerator } from "./popup"

import '../style/popup/slide_option_selector.css'

export type SlideDeletingOption = 'ALL' | 'SELECTED_ONLY'

export class SlideDeletingOptionSetterPopup extends PopupGenerator<SlideDeletingOption> {

    private static createButton(what: string, onclick: () => void) {
        const created_button: HTMLButtonElement = document.createElement('button')

        created_button.append(
            $createSpan('현재 선택된 '),
            $createSpan(what, 'highlight'),
            $createSpan(' 삭제')
        )
        created_button.onclick = onclick
        return created_button
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: SlideDeletingOption | null) => void): void {

        const created_options = element_popup.appendChild($create('ul', 'slide-options'))
        created_options.append(
            SlideDeletingOptionSetterPopup.createButton('노래', () => resolve('ALL')),
            SlideDeletingOptionSetterPopup.createButton('가사만', () => resolve('SELECTED_ONLY'))
        )

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

    }
}
