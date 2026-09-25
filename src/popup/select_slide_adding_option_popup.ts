import { $create, $createDiv } from "../main"
import type { ModifiedSongData } from "../song_settingt"
import { PopupGenerator } from "./popup"

export class SlideAddingOptionSetterPopup extends PopupGenerator<number> {


    protected draw(element_popup: HTMLDivElement, resolve: (value: number | null) => void): void {

        /*
            
            1. 현재 선택된 슬라이드 앞에 새 가사 삽입
            2. 현재 선택된 슬라이드 뒤에 새 가사 삽입
            3. 현재 선택된 슬라이드 앞에 새 노래 삽입
            4. 현재 선택된 슬라이드 뒤에 새 노래 삽입

        */

        const created_options = element_popup.appendChild($create('ul', 'slide-adding-options'))
        created_options.append(
            $createDiv('현재 선택된 슬라이드 앞에 새 가사 삽입'),
            $createDiv('현재 선택된 슬라이드 뒤에 새 가사 삽입'),
            $createDiv('현재 선택된 슬라이드 앞에 새 노래 삽입'),
            $createDiv('현재 선택된 슬라이드 뒤에 새 노래 삽입')
        )

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

        // this.addPositiveButton('저장', () => {
        //     resolve(null)
        // })

    }
}
