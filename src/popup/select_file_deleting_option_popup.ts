import { $create, $createSpan } from "../main"
import { PopupGenerator } from "./popup"

import '../style/popup/slide_option_selector.css'
import type { FileDeletingOption } from "../song_settingt"


export class FileDeletingOptionSetterPopup extends PopupGenerator<FileDeletingOption> {

    private static createButton(what: string, onclick: () => void) {
        const created_button: HTMLButtonElement = document.createElement('button')

        created_button.append(
            $createSpan(what, 'highlight'),
            $createSpan(' 삭제')
        )
        created_button.onclick = onclick
        return created_button
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: FileDeletingOption | null) => void): void {

        const created_options = element_popup.appendChild($create('ul', 'slide-options'))
        created_options.append(
            FileDeletingOptionSetterPopup.createButton('파일만', () => resolve('ONLY_FILE')),
            FileDeletingOptionSetterPopup.createButton('파일 및 파일 내 노래 일괄', () => resolve('CASCADE'))
        )

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

    }
}
