import { $create, $createSpan } from '../other/utils';
import { PopupGenerator } from './popup';
import type { SlideDeletingOption } from '../types/popup_data';

import '../style/popup/slide_option_selector.css';

export class SlideDeletingOptionSetterPopup extends PopupGenerator<SlideDeletingOption> {
  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: SlideDeletingOption | null) => void,
  ): void {
    const created_options = $create('ul', 'slide-options');

    created_options.append(
      this.createOptionButton('현재 선택된 ', '노래 소속 슬라이드 일괄', () =>
        resolve('SELCTED_SONG'),
      ),
      this.createOptionButton('현재 선택된 ', '가사 슬라이드만', () =>
        resolve('SELECTED_TEXT'),
      ),
      this.createOptionButton('', '모든 노래 슬라이드 일괄', () =>
        resolve('ALL'),
      ),
    );

    element_popup.replaceChildren(created_options);

    this.addNegativeButton('취소', () => {
      resolve(null);
    });
  }

  private createOptionButton(
    prefix: string,
    what: string,
    onclick: () => void,
  ): HTMLButtonElement {
    const created_button: HTMLButtonElement = document.createElement('button');

    created_button.onclick = onclick;

    created_button.append(
      $createSpan(prefix),
      $createSpan(what, 'highlight'),
      $createSpan(' 삭제'),
    );

    return created_button;
  }
}
