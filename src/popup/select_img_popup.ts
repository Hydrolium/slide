import { PopupGenerator } from "./popup"
import type { ImageInfo } from "../song_settingt"

import '../style/popup/img_selector.css'
import { $create, $createDiv } from "../main"

export class ImgSelectorPopup extends PopupGenerator<string> {
    private readonly imgs: Record<string, ImageInfo>

    constructor(imgs: Record<string, ImageInfo>) {
        super()
        this.imgs = imgs
    }

    protected draw(element_popup: HTMLDivElement, resolve: (value: string | null) => void): void {

        const created_imgBoxList = element_popup.appendChild($create('div', 'img-box-list'))

        Object.entries(this.imgs).forEach(([name, info]) => {
            const created_imgBox = created_imgBoxList.appendChild($create('div', 'img-box'))
            created_imgBox.onclick = () => resolve(name)

            const created_img = created_imgBox.appendChild($create('img'))
            created_img.src = info.url
            
            created_imgBox.appendChild($createDiv(name))
        })

        element_popup.appendChild($createDiv('새로운 이미지를 추가하려면 메인화면의 [파일추가]를 선택하세요', 'tip'))

        this.addNegativeButton('취소', () => {
            resolve(null)
        })

    }
}
