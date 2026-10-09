import { $create, $createSpan } from '../other/utils';
import { PopupGenerator } from './popup';
import type { SlideAddingOption } from '../types/popup_data';

import '../style/popup/slide_option_selector.css';

export class SlideAddingOptionSetterPopup extends PopupGenerator<SlideAddingOption> {
  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: SlideAddingOption | null) => void,
  ): void {
    const created_options = $create('ul', 'slide-options');

    created_options.append(
      this.createOptionButton('앞', '가사', () =>
        resolve('INSERT_LYRICS_BEFORE'),
      ),
      this.createOptionButton('뒤', '가사', () =>
        resolve('INSERT_LYRICS_AFTER'),
      ),
      this.createOptionButton('앞', '노래', () =>
        resolve('INSERT_SONG_BEFORE'),
      ),
      this.createOptionButton('뒤', '노래', () => resolve('INSERT_SONG_AFTER')),
    );

    element_popup.replaceChildren(created_options);

    this.addNegativeButton('취소', () => {
      resolve(null);
    });
  }

  private createOptionButton(pos: string, what: string, onclick: () => void) {
    const created_button: HTMLButtonElement = document.createElement('button');

    created_button.onclick = onclick;

    created_button.append(
      $createSpan('현재 선택된 슬라이드 '),
      $createSpan(pos, 'highlight'),
      $createSpan('에 새 '),
      $createSpan(what, 'highlight'),
      $createSpan(' 삽입'),
    );
    return created_button;
  }
}
