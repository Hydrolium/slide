import { $create, $createSpan } from '../utils';
import { PopupGenerator } from './popup';

import '../style/popup/slide_option_selector.css';

export type SlideDeletingOption = 'SELCTED_SONG' | 'SELECTED_TEXT' | 'ALL';

export class SlideDeletingOptionSetterPopup extends PopupGenerator<SlideDeletingOption> {
  private static createButton(
    prefix: string,
    what: string,
    onclick: () => void,
  ): HTMLButtonElement {
    const created_button: HTMLButtonElement = document.createElement('button');

    created_button.append(
      $createSpan(prefix),
      $createSpan(what, 'highlight'),
      $createSpan(' 삭제'),
    );
    created_button.onclick = onclick;
    return created_button;
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: SlideDeletingOption | null) => void,
  ): void {
    const created_options = element_popup.appendChild(
      $create('ul', 'slide-options'),
    );
    created_options.append(
      SlideDeletingOptionSetterPopup.createButton(
        '현재 선택된 ',
        '노래 소속 슬라이드 일괄',
        () => resolve('SELCTED_SONG'),
      ),
      SlideDeletingOptionSetterPopup.createButton(
        '현재 선택된 ',
        '가사 슬라이드만',
        () => resolve('SELECTED_TEXT'),
      ),
      SlideDeletingOptionSetterPopup.createButton(
        '',
        '모든 노래 슬라이드 일괄',
        () => resolve('ALL'),
      ),
    );

    this.addNegativeButton('취소', () => {
      resolve(null);
    });
  }
}
