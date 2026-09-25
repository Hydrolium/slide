import { $create, $createDiv, $createSpan } from "../main"
import { PopupGenerator } from "./popup"

import '../style/popup/slide_adding_option_selector.css'

export type SlideAddingOption = 'INSERT_LYRICS_BEFORE' | 'INSERT_LYRICS_AFTER' | 'INSERT_SONG_BEFORE' | 'INSERT_SONG_AFTER'

export class SlideAddingOptionSetterPopup extends PopupGenerator<SlideAddingOption> {

    private static createButton(pos: string, what: string, onclick: () => void) {
        const created_button: HTMLButtonElement = document.createElement('button')

        created_button.append(
            $createSpan('현재 선택된 슬라이드 '),
            $createSpan(pos, 'highlight'),
            $createSpan('에 새 '),
            $createSpan(what, 'highlight'),
            $createSpan(' 삽입')
        )
        created_button.onclick = onclick
        return created_button
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: SlideAddingOption | null) => void): void {

        const created_options = element_popup.appendChild($create('ul', 'slide-adding-options'))
        created_options.append(
            SlideAddingOptionSetterPopup.createButton('앞', '가사', () => resolve('INSERT_LYRICS_BEFORE')),
            SlideAddingOptionSetterPopup.createButton('뒤', '가사', () => resolve('INSERT_LYRICS_AFTER')),
            SlideAddingOptionSetterPopup.createButton('앞', '노래', () => resolve('INSERT_SONG_BEFORE')),
            SlideAddingOptionSetterPopup.createButton('뒤', '노래', () => resolve('INSERT_SONG_AFTER'))
        )

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

    }
}
