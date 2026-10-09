import { $create, $createDiv, $createSpan } from '../other/utils';
import { PopupGenerator } from './popup';

import '../style/popup/slide_option_selector.css';

export class FileExportingOptionSetterPopup extends PopupGenerator<number> {
  private readonly idToTitle: Map<number, string>;

  public static readonly EXPORT_ALL = -1;

  constructor(idToTitle: Map<number, string>) {
    super();
    this.idToTitle = idToTitle;
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: number | null) => void,
  ): void {
    const created_exportingButtonBox = $create('ul', 'slide-options');
    const created_exportingAllButton = $create('button');
    const created_singleExportingButtonBox = $create('div', 'button-box');

    created_exportingAllButton.onclick = () =>
      resolve(FileExportingOptionSetterPopup.EXPORT_ALL);

    created_exportingAllButton.append(
      $createSpan('전체', 'highlight'),
      $createSpan(' 내보내기'),
    );

    created_exportingButtonBox.append(
      created_exportingAllButton,
      created_singleExportingButtonBox,
    );

    created_singleExportingButtonBox.append(
      ...Array.from(this.idToTitle, ([id, title]) =>
        this.createOptionButton(title, () => resolve(id)),
      ),
    );

    element_popup.replaceChildren(
      created_exportingButtonBox,
      $createDiv(
        '내보내기 시 슬라이드에 사용된 배경 이미지파일이 포함된 zip 파일이 다운로드됩니다.',
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
    const created_button = $create('button');

    created_button.onclick = onclick;

    created_button.append(
      $createSpan("'"),
      $createSpan(what, 'highlight'),
      $createSpan("' 내보내기"),
    );

    return created_button;
  }
}
