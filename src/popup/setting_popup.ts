import { $create, $createDiv, $createNumberInput } from '../other/utils';
import { PopupGenerator } from './popup';

import '../style/popup/setting_editor.css';

export class SettingEditorPopup extends PopupGenerator<null> {
  private readonly initialTitleFontSize: string;
  private readonly initialTextFontSize: string;
  private readonly titleSizeController: (size: string) => void;
  private readonly textSizeController: (size: string) => void;

  constructor(
    titleFontSize: number,
    textFontSize: number,
    titleSizeController: (size: string) => void,
    textSizeController: (size: string) => void,
  ) {
    super();

    this.initialTitleFontSize = titleFontSize.toString();
    this.initialTextFontSize = textFontSize.toString();
    this.titleSizeController = titleSizeController;
    this.textSizeController = textSizeController;
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: null) => void,
  ): void {
    const created_settingList = $create('ul', 'setting-list');

    created_settingList.append(
      this.createdNumberInputSettingItem(
        '타이틀 크기',
        this.initialTitleFontSize,
        (e: Event) => {
          if (e.target instanceof HTMLInputElement)
            this.titleSizeController(e.target.value);
        },
      ),
      this.createdNumberInputSettingItem(
        '텍스트 크기',
        this.initialTextFontSize,
        (e: Event) => {
          if (e.target instanceof HTMLInputElement)
            this.textSizeController(e.target.value);
        },
      ),
    );

    element_popup.replaceChildren(created_settingList);

    this.addNegativeButton('닫기', () => {
      resolve(null);
    });
  }

  private createdNumberInputSettingItem(
    label: string,
    initialValue: string,
    onchange: (e: Event) => void,
  ): HTMLLIElement {
    const created_settingItem = $create('li', 'setting-item');
    const created_input = $createNumberInput(initialValue, '0', '', '0.1');

    created_input.onchange = onchange;

    created_settingItem.append(
      $createDiv(label, 'setting-label'),
      created_input,
    );

    return created_settingItem;
  }
}
