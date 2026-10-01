import { $create, $createDiv, $createSpan } from '../utils';
import { PopupGenerator } from './popup';

import '../style/popup/slide_option_selector.css';

export class FileExportingOptionSetterPopup extends PopupGenerator<number> {
  private readonly idToTitle: Map<number, string>;

  public static readonly EXPORT_ALL = -1;

  constructor(idToTitle: Map<number, string>) {
    super();
    this.idToTitle = idToTitle;
  }

  private static createButton(
    what: string,
    onclick: () => void,
  ): HTMLButtonElement {
    const created_button = $create('button');

    created_button.append(
      $createSpan("'"),
      $createSpan(what, 'highlight'),
      $createSpan("' 내보내기"),
    );
    created_button.onclick = onclick;
    return created_button;
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: number | null) => void,
  ): void {
    const created_options = element_popup.appendChild(
      $create('ul', 'slide-options'),
    );

    const created_button = created_options.appendChild($create('button'));

    created_button.append(
      $createSpan('전체', 'highlight'),
      $createSpan(' 내보내기'),
    );
    created_button.onclick = () =>
      resolve(FileExportingOptionSetterPopup.EXPORT_ALL);

    const created_buttonBox = created_options.appendChild(
      $create('div', 'button-box'),
    );

    this.idToTitle.forEach((title, id) =>
      created_buttonBox.appendChild(
        FileExportingOptionSetterPopup.createButton(title, () => resolve(id)),
      ),
    );

    element_popup.appendChild(
      $createDiv(
        '내보내기 시 슬라이드에 사용된 배경 이미지파일이 포함된 zip 파일이 다운로드됩니다.',
        'tip',
      ),
    );

    this.addNegativeButton('취소', () => {
      resolve(null);
    });
  }
}
