import { $create, $createDiv } from '../other/utils';
import { PopupGenerator } from './popup';
import type { ImgRecord } from '../types/song';

import '../style/popup/img_selector.css';

export class ImgSelectorPopup extends PopupGenerator<string> {
  private readonly imgs: Readonly<ImgRecord>;

  constructor(imgs: Readonly<ImgRecord>) {
    super();
    this.imgs = imgs;
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: string | null) => void,
  ): void {
    const created_imgBoxList = $create('div', 'img-box-list');

    created_imgBoxList.append(
      ...Object.entries(this.imgs).map(([name, info]) => {
        const created_imgBox = $create('div', 'img-box');
        const created_img = $create('img');

        created_imgBox.addEventListener('click', () => resolve(name));

        created_img.src = info.url;

        created_imgBox.append(created_img, $createDiv(name));

        return created_imgBox;
      }),
    );

    element_popup.replaceChildren(
      created_imgBoxList,
      $createDiv(
        '새로운 이미지를 추가하려면 메인화면의 [파일추가]를 선택하세요',
        'tip',
      ),
    );

    this.addNegativeButton('취소', () => {
      resolve(null);
    });
  }
}
