import { $create, $createCheckbox, $createDiv } from '../other/utils';
import { PopupGenerator } from './popup';
import { FileDeletingOptionSetterPopup } from './select_file_deleting_option_popup';
import type { ImgRecord } from '../types/song';
import type { ManagementResult } from '../types/popup_data';

import '../style/popup/file_resetter.css';

export class FileManagerPopup extends PopupGenerator<ManagementResult> {
  readonly jsonFiles: Readonly<Record<string, string>>;
  readonly imgFiles: Readonly<ImgRecord>;

  private readonly managementResult: ManagementResult = {
    removedImgs: new Set(),
    removedJsons: {},
    refreshedJsons: new Set(),
  };

  constructor(
    jsonCandidates: Record<string, string>,
    imgCandidates: ImgRecord,
  ) {
    super();

    this.jsonFiles = { ...jsonCandidates };
    this.imgFiles = { ...imgCandidates };
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: ManagementResult | null) => void,
  ): void {
    const created_existingFileList = $create('ul', 'file-list');

    this.renderFileList(created_existingFileList);

    element_popup.append(
      created_existingFileList,
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

  private createJsonFileItem(fileName: string, detail: string): HTMLLIElement {
    const created_fileItem = $create('li', 'file-item');
    const created_buttonBox = $create('div', 'file-button-box');
    const created_removeLabel = $create('label', 'remove-file-label');
    const created_removeCheckbox = $createCheckbox('remove-file-checkbox');
    const created_refreshLabel = $create('label', 'refresh-file-label');
    const created_refreshCheckbox = $createCheckbox('refresh-file-checkbox');

    created_removeCheckbox.addEventListener('change', async () => {
      if (created_removeCheckbox.checked) {
        const result = await FileDeletingOptionSetterPopup.show();
        if (!result) {
          created_removeCheckbox.checked = false;
          return;
        }
        created_refreshLabel.style.display = 'none';

        this.managementResult.refreshedJsons.delete(fileName); // 혹시 모를 중복 제거
        created_removeLabel.classList.add(
          result === 'FILE_AND_SONGS' ? 'file-and-songs' : 'only-file',
        );
        this.managementResult.removedJsons[fileName] = result;
      } else {
        created_refreshLabel.style.display = 'block';

        this.managementResult.refreshedJsons.delete(fileName); // 혹시 모를 중복 제거

        delete this.managementResult.removedJsons[fileName];
        created_removeLabel.classList.remove('file-and-songs', 'only-file');
      }
    });

    created_refreshCheckbox.addEventListener('change', () => {
      if (created_refreshCheckbox.checked) {
        created_removeLabel.style.display = 'none';

        this.managementResult.refreshedJsons.add(fileName);
        delete this.managementResult.removedJsons[fileName]; // 혹시 모를 중복 제거
      } else {
        created_removeLabel.style.display = 'block';

        this.managementResult.refreshedJsons.delete(fileName);
        delete this.managementResult.removedJsons[fileName]; // 혹시 모를 중복 제거
      }
    });

    created_removeLabel.append(created_removeCheckbox);
    created_refreshLabel.append(created_refreshCheckbox);

    created_buttonBox.append(created_removeLabel, created_refreshLabel);

    created_fileItem.append(
      created_buttonBox,
      $createDiv(fileName, 'file-item-text'),
      $createDiv(detail, 'file-item-detail'),
    );

    return created_fileItem;
  }

  private createImgFileItem(fileName: string, imgUrl: string): HTMLLIElement {
    const created_fileItem = $create('li', 'file-item');
    const created_removeLabel = $create('label', 'remove-file-label');
    const created_removeCheckbox = $createCheckbox('remove-file-checkbox');
    const created_img = $create('img', 'file-item-img');

    created_removeCheckbox.type = 'checkbox';
    created_removeCheckbox.addEventListener('change', async () => {
      if (created_removeCheckbox.checked)
        this.managementResult.removedImgs.add(fileName);
      else this.managementResult.removedImgs.delete(fileName);
    });

    created_img.src = imgUrl;

    created_removeLabel.append(created_removeCheckbox);

    created_fileItem.append(
      created_removeLabel,
      created_img,
      $createDiv(fileName, 'file-item-text'),
    );

    return created_fileItem;
  }

  private renderFileList(element_existingFileList: HTMLUListElement): void {
    if (
      Object.keys(this.imgFiles).length === 0 &&
      Object.keys(this.jsonFiles).length === 0
    ) {
      element_existingFileList.replaceChildren(
        $createDiv(
          '추가된 파일이 없습니다. 메인화면의 [파일추가]에서 파일을 업로드하세요.',
          'tip',
        ),
      );
      return;
    }

    element_existingFileList.replaceChildren(
      ...Object.entries(this.imgFiles).map(([name, info]) =>
        this.createImgFileItem(name, info.url),
      ),
      ...Object.entries(this.jsonFiles).map(([name, detail]) =>
        this.createJsonFileItem(name, `(${detail})`),
      ),
    );
  }
}
