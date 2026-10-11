import { $createDiv } from '../other/utils';
import { PopupGenerator } from './popup';

import '../style/popup/error_message.css';

export class ErrorMessagePopup extends PopupGenerator<null> {
  private readonly errorMessage: string;

  constructor(errorMessage: string) {
    super();

    this.errorMessage = errorMessage;
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: null) => void,
  ): void {
    element_popup.replaceChildren(
      $createDiv('에러 발생', 'error-title'),
      $createDiv(this.errorMessage, 'error-message'),
    );

    this.addNegativeButton('닫기', () => {
      resolve(null);
    });
  }
}
