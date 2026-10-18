import { $create } from '../other/utils';
import { PopupGenerator } from './popup';

import '../style/popup/loading.css';

export class LoadingPopup extends PopupGenerator<null> {
  protected draw(element_popup: HTMLDivElement): void {
    element_popup.classList.add('invisible');
    element_popup.replaceChildren($create('div', 'loading'));
  }
}
