import { $create, $createDiv, $createSpan } from "../main"
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

        element_popup.appendChild($createDiv('<파일만 삭제>: 현재 추가된 슬라이드는 유지하고, 파일만 리스트에서 삭제합니다.', 'tip'))
        element_popup.appendChild($createDiv('<파일 및 파일 내 노래 일괄 삭제>: 파일에 소속된 모든 노래 슬라이드가 제거됩니다.', 'tip'))

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

    }
}
