import { $create, $createDiv } from '../other/utils';
import { PopupGenerator } from './popup';
import type { SongInfo, SongRecord } from '../types/song';

import '../style/popup/slide_sorter.css';

export class SlideSorterPopup extends PopupGenerator<readonly number[]> {
  private idList: number[] = [];
  private infoMap: SongRecord = {};

  constructor(
    idList: readonly number[],
    infoMap: Readonly<SongRecord>,
  ) {
    super();

    this.idList = [...idList];
    this.infoMap = { ...infoMap };
  }

  private moveUp(
    element_sortSlideBox: HTMLUListElement,
    targetId: number,
  ): void {
    const targetIdx = this.idList.indexOf(targetId);
    if (targetIdx <= 0) return;

    [this.idList[targetIdx], this.idList[targetIdx - 1]] = [
      this.idList[targetIdx - 1],
      this.idList[targetIdx],
    ];

    this.renderSlideBox(element_sortSlideBox);
  }

  private moveDown(
    element_sortSlideBox: HTMLUListElement,
    targetId: number,
  ): void {
    const targetIdx = this.idList.indexOf(targetId);
    if (targetIdx === -1 || targetIdx >= this.idList.length - 1) return;

    [this.idList[targetIdx], this.idList[targetIdx + 1]] = [
      this.idList[targetIdx + 1],
      this.idList[targetIdx],
    ];

    this.renderSlideBox(element_sortSlideBox);
  }

  private createItem(
    element_sortSlideBox: HTMLUListElement,
    id: number,
  ): HTMLLIElement {
    const created_li = $create('li', 'sort-item');

    const created_buttonBox = $create('div', 'sort-up-down-buttons');

    const created_upButton = $create('button', 'sort-up-button');
    created_upButton.addEventListener('click', () => {
      this.moveUp(element_sortSlideBox, id);
    });
    created_buttonBox.appendChild(created_upButton);

    const created_downButton = $create('button', 'sort-down-button');
    created_downButton.addEventListener('click', () => {
      this.moveDown(element_sortSlideBox, id);
    });
    created_buttonBox.appendChild(created_downButton);

    const created_removeButton = $create('button', 'sort-remove-button');
    created_removeButton.addEventListener('click', () => {
      this.idList = this.idList.filter((i) => i != id);
      this.renderSlideBox(element_sortSlideBox);
    });
    created_buttonBox.appendChild(created_removeButton);

    created_li.appendChild(created_buttonBox);

    created_li.appendChild(
      $createDiv(this.infoMap[id].title, 'sort-item-text'),
    );

    return created_li;
  }

  private renderSlideBox(element_sortSlideBox: HTMLUListElement): void {
    element_sortSlideBox.replaceChildren(
      ...this.idList.map((id) => this.createItem(element_sortSlideBox, id)),
    );

    if (this.idList.length === 0)
      element_sortSlideBox.appendChild(
        $createDiv(
          '슬라이드가 없습니다.\n메인화면의 [추가하기]로 새 슬라이드를 생성하거나 [파일추가]로 파일을 업로드하세요.',
          'tip',
        ),
      );
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: readonly number[] | null) => void,
  ): void {
    const created_sortSlideBox = $create('ul', 'sort-slide-box');

    element_popup.appendChild(created_sortSlideBox);

    this.renderSlideBox(created_sortSlideBox);

    this.addNegativeButton('취소', () => {
      resolve(null);
    });

    this.addPositiveButton('저장', () => {
      resolve(this.idList);
    });
  }
}
