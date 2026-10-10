import { PopupGenerator } from './popup';
import { $createDiv, $createTextInput } from '../other/utils';

import '../style/popup/song_title_getter.css';

export class SongTitleGetterPopup extends PopupGenerator<string> {
  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: string | null) => void,
  ): void {
    const created_textInput = $createTextInput('', 'song-title-input');
    created_textInput.placeholder = '제목을 입력하세요';

    element_popup.append(
      $createDiv('노래 제목을 입력하세요', 'song-title-div'),
      created_textInput,
    );

    this.addNegativeButton('취소', () => {
      resolve(null);
    });

    this.addPositiveButton('저장', () => {
      resolve(created_textInput.value);
    });
  }
}
