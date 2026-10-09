import { $create, $createDiv, $createSpan } from '../other/utils';
import { PopupGenerator } from './popup';
import type { FileDeletingOption } from '../types/popup_data';

import '../style/popup/slide_option_selector.css';

export class FileDeletingOptionSetterPopup extends PopupGenerator<FileDeletingOption> {
  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: FileDeletingOption | null) => void,
  ): void {
    const created_options = $create('ul', 'slide-options');

    created_options.append(
      this.createOptionButton('파일만', () => resolve('ONLY_FILE')),
      this.createOptionButton('파일 및 파일 내 노래 일괄', () =>
        resolve('FILE_AND_SONGS'),
      ),
    );

    element_popup.replaceChildren(
      created_options,
      $createDiv(
        '<파일만 삭제>: 현재 추가된 슬라이드는 유지하고, 파일만 리스트에서 삭제합니다.',
        'tip',
      ),
      $createDiv(
        '<파일 및 파일 내 노래 일괄 삭제>: 파일에 소속된 모든 노래 슬라이드가 제거됩니다.',
        'tip',
      ),
    );

    this.addNegativeButton('취소', () => {
      resolve(null);
    });
  }

  private createOptionButton(
    what: string,
    onclick: () => void,
  ): HTMLButtonElement {
    const created_button: HTMLButtonElement = document.createElement('button');

    created_button.addEventListener('click', onclick);

    created_button.append($createSpan(what, 'highlight'), $createSpan(' 삭제'));

    return created_button;
  }
}
