import { $create, $createDiv } from '../utils';
import type { ImageInfo, ManagementResult } from '../manager/song_setting';
import { PopupGenerator } from './popup';
import { FileDeletingOptionSetterPopup } from './select_file_deleting_option_popup';

import '../style/popup/file_resetter.css';

export class FileManagerPopup extends PopupGenerator<ManagementResult> {
  readonly jsonFiles: Readonly<Record<string, string>>;
  readonly imgFiles: Readonly<Record<string, ImageInfo>>;

  private readonly managementResult: ManagementResult = {
    removedImgs: new Set(),
    removedJsons: {},
    refreshedJsons: new Set(),
  };

  constructor(
    jsonCandidates: Record<string, string>,
    imgCandidates: Record<string, ImageInfo>,
  ) {
    super();

    this.jsonFiles = { ...jsonCandidates };
    this.imgFiles = { ...imgCandidates };
  }

  private createJsonFileItem(fileName: string, detail: string): HTMLLIElement {
    const created_fileItem = $create('li', 'file-item');

    const created_buttonBox = created_fileItem.appendChild(
      $create('div', 'file-button-box'),
    );

    const created_removeLabel = created_buttonBox.appendChild(
      $create('label', 'remove-file-label'),
    );
    const created_removeCheckbox = created_removeLabel.appendChild(
      $create('input', 'remove-file-checkbox'),
    );
    const created_refreshLabel = created_buttonBox.appendChild(
      $create('label', 'refresh-file-label'),
    );
    const created_refreshCheckbox = created_refreshLabel.appendChild(
      $create('input', 'refresh-file-checkbox'),
    );

    created_removeCheckbox.type = 'checkbox';
    created_removeCheckbox.addEventListener('change', async (e: Event) => {
      if ((e.target as HTMLInputElement).checked) {
        const result = await FileDeletingOptionSetterPopup.show();
        if (!result) {
          (e.target as HTMLInputElement).checked = false;
          return;
        }
        created_refreshLabel.style.display = 'none';

        this.managementResult.refreshedJsons.delete(fileName); // 혹시 모를 중복 제거
        created_removeLabel.classList.add(
          result === 'CASCADE' ? 'cascade' : 'only-file',
        );
        this.managementResult.removedJsons[fileName] = result;
      } else {
        created_refreshLabel.style.display = 'block';

        this.managementResult.refreshedJsons.delete(fileName); // 혹시 모를 중복 제거

        delete this.managementResult.removedJsons[fileName];
        created_removeLabel.classList.remove('cascade', 'only-file');
      }
    });

    created_refreshCheckbox.type = 'checkbox';
    created_refreshCheckbox.addEventListener('change', (e: Event) => {
      if ((e.target as HTMLInputElement).checked) {
        created_removeLabel.style.display = 'none';

        this.managementResult.refreshedJsons.add(fileName);
        delete this.managementResult.removedJsons[fileName]; // 혹시 모를 중복 제거
      } else {
        created_removeLabel.style.display = 'block';

        this.managementResult.refreshedJsons.delete(fileName);
        delete this.managementResult.removedJsons[fileName]; // 혹시 모를 중복 제거
      }
    });

    created_fileItem.appendChild($createDiv(fileName, 'file-item-text'));

    created_fileItem.appendChild($createDiv(detail, 'file-item-detail'));

    return created_fileItem;
  }

  private createImgFileItem(fileName: string, imgUrl: string): HTMLLIElement {
    const created_fileItem = $create('li', 'file-item');

    const created_removeLabel = created_fileItem.appendChild(
      $create('label', 'remove-file-label'),
    );
    const created_removeCheckbox = created_removeLabel.appendChild(
      $create('input', 'remove-file-checkbox'),
    );

    created_removeCheckbox.type = 'checkbox';
    created_removeCheckbox.addEventListener('change', async (e: Event) => {
      if ((e.target as HTMLInputElement).checked)
        this.managementResult.removedImgs.add(fileName);
      else this.managementResult.removedImgs.delete(fileName);
    });

    const created_img = created_fileItem.appendChild(
      $create('img', 'file-item-img'),
    );
    created_img.src = imgUrl;

    created_fileItem.appendChild($createDiv(fileName, 'file-item-text'));

    return created_fileItem;
  }

  private renderFileList(element_existingFileList: HTMLUListElement): void {
    element_existingFileList?.replaceChildren();

    Object.entries(this.imgFiles).forEach(([name, info]) => {
      element_existingFileList?.appendChild(
        this.createImgFileItem(name, info.url),
      );
    });

    Object.entries(this.jsonFiles).forEach(([name, detail]) => {
      element_existingFileList?.appendChild(
        this.createJsonFileItem(name, `(${detail})`),
      );
    });
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: ManagementResult | null) => void,
  ): void {
    const created_existingFileList = $create('ul', 'file-list');
    element_popup.appendChild(created_existingFileList);

    if (
      Object.keys(this.imgFiles).length === 0 &&
      Object.keys(this.jsonFiles).length === 0
    )
      element_popup.appendChild(
        $createDiv(
          '추가된 파일이 없습니다. 메인화면의 [파일추가]에서 파일을 업로드하세요.',
          'tip',
        ),
      );
    else this.renderFileList(created_existingFileList);

    element_popup.appendChild(
      $createDiv(
        'json 파일 새로고침 시 파일 내 모든 노래 슬라이드가 삭제 후 다시 추가됩니다.',
        'tip',
      ),
    );

    this.addNegativeButton('취소', () => {
      resolve(null);
    });

    this.addPositiveButton('저장', () => {
      resolve(structuredClone(this.managementResult));
    });
  }
}
