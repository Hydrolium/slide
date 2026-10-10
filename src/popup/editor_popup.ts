import {
  $create,
  $createColorInput,
  $createDiv,
  $createNumberInput,
  $createRangeInput,
  $createTextArea,
  $createTextInput,
  splitHex,
  withOpacity,
} from '../other/utils';
import { PopupGenerator } from './popup';
import { ImgSelectorPopup } from './select_img_popup';
import type { ImgRecord, ModifiedSongData } from '../types/song';
import { attachProperty } from '../other/css_property_attacher';

import '../style/slide_style.css';
import '../style/popup/slide_editor.css';

export class EditorPopup extends PopupGenerator<ModifiedSongData> {
  private readonly songData: Mutable<ModifiedSongData>;
  private readonly imgs: Readonly<ImgRecord>;

  constructor(songData: ModifiedSongData, imgs: Readonly<ImgRecord>) {
    super();
    this.songData = structuredClone({
      ...songData,
      texts: [...songData.texts],
    });
    this.imgs = imgs;
  }

  protected draw(
    element_popup: HTMLDivElement,
    resolve: (value: ModifiedSongData | null) => void,
  ): void {
    const created_editorInputsBox = $create('div', 'editor-inputs-box');

    const created_slideInputFrame = $create(
      'div',
      'text-inputs',
      'slide-frame',
      'editor-mode',
    );
    const created_slideLayerContainer = $create('div', 'slide-layer-container');
    const created_defaultLayer = $create('div', 'default-layer');

    const created_titleInput = $createTextInput('', 'slide-title');
    const created_textArea = $createTextArea('', 4, 10, 'slide-text');

    const created_backgroundChangeButton = $create('button');
    const created_titleColorEditorBox = this.createdColorEditorBox(
      this.songData.titleColor,
      (color) => {
        attachProperty(created_slideInputFrame, { titleColor: color });
        this.songData.titleColor = color;
      },
      this.songData.titleStroke,
      (color) => {
        attachProperty(created_slideInputFrame, {
          titleStrokeColor: color,
          titleStrokeThickness: '2px',
        });

        this.songData.titleStroke = color;
      },
      this.songData.titleShadow,
      (color) => {
        attachProperty(created_slideInputFrame, {
          titleShadowColor: color,
          titleShadowOffset: '3.5px',
        });

        this.songData.titleShadow = color;
      },
    );
    const created_textColorEditorBox = this.createdColorEditorBox(
      this.songData.textColor,
      (color) => {
        attachProperty(created_slideInputFrame, { textColor: color });

        this.songData.textColor = color;
      },
      this.songData.textStroke,
      (color) => {
        attachProperty(created_slideInputFrame, {
          textStrokeColor: color,
          textStrokeThickness: '2px',
        });

        this.songData.textStroke = color;
      },
      this.songData.textShadow,
      (color) => {
        attachProperty(created_slideInputFrame, {
          textShadowColor: color,
          textShadowOffset: '3.5px',
        });
        this.songData.textShadow = color;
      },
    );

    attachProperty(created_slideInputFrame, {
      titleFontSize: '40px',
      textFontSize: '33px',
      defaultLayerImg: `url("${this.imgs[this.songData.background]?.url}")`,
    });

    created_titleInput.value = this.songData.texts[this.songData.textIdx].title;
    created_titleInput.addEventListener('change', () => {
      this.songData.texts[this.songData.textIdx].title =
        created_titleInput.value;
    });

    created_textArea.value = this.songData.texts[this.songData.textIdx].text;
    created_textArea.addEventListener('change', () => {
      this.songData.texts[this.songData.textIdx].text = created_textArea.value;
    });

    created_backgroundChangeButton.textContent = '배경 변경';
    created_backgroundChangeButton.classList.add('background-change-button');
    created_backgroundChangeButton.addEventListener('click', async () => {
      const result = await ImgSelectorPopup.show(this.imgs);
      if (result) {
        const url = this.imgs[result].url;
        attachProperty(created_slideInputFrame, {defaultLayerImg:  `url("${url}")`});
        this.songData.background = result;
      }
    });

    created_slideLayerContainer.append(created_defaultLayer);
    created_slideInputFrame.append(
      created_slideLayerContainer,
      created_titleInput,
      created_textArea,
    );

    created_editorInputsBox.append(
      created_titleColorEditorBox,
      created_slideInputFrame,
      created_textColorEditorBox,
    );

    element_popup.replaceChildren(
      created_editorInputsBox,
      created_backgroundChangeButton,
      $createDiv('색상, 배경은 변경시 같은 노래가 전부 변경됩니다.', 'tip'),
    );

    this.addNegativeButton('취소', () => {
      resolve(null);
    });

    this.addPositiveButton('저장', () => {
      resolve({ ...this.songData });
    });
  }

  private createColorInputItem(
    label: string,
    color: string,
    onchange: (color: string) => void,
  ): HTMLDivElement {
    const created_inputEditor = $create('div', 'input-editor');

    created_inputEditor.appendChild($createDiv(label, 'input-editor-label'));

    const created_input = $createColorInput(color);
    created_input.addEventListener('change', () =>
      onchange(created_input.value),
    );

    created_inputEditor.appendChild(created_input);

    onchange(color); // 최초 1회 실행해서 색상 초기화

    return created_inputEditor;
  }

  private createColorWithOpacityInputItem(
    label: string,
    color: string,
    onchange: (color: string) => void,
  ): DocumentFragment {
    const splitedColor = splitHex(color);

    const created_container = document.createDocumentFragment();

    const created_colorInputEditor = $create('div', 'input-editor');

    const created_colorInput = $createColorInput(splitedColor.color);

    created_colorInputEditor.append(
      $createDiv(label + ' 색상', 'input-editor-label'),
      created_colorInput,
    );

    const created_opacityInputEditor = $create('div', 'input-editor');

    const created_rangeInput = $createRangeInput(splitedColor.opacityPercent);
    const created_numberInput = $createNumberInput(splitedColor.opacityPercent);

    created_opacityInputEditor.append(
      $createDiv(label + ' 투명도', 'input-editor-label'),
      created_rangeInput,
      created_numberInput,
    );

    created_container.append(
      created_colorInputEditor,
      created_opacityInputEditor,
    );

    created_colorInput.addEventListener('change', () =>
      onchange(withOpacity(created_colorInput.value, created_rangeInput.value)),
    );

    created_rangeInput.addEventListener('change', () => {
      created_numberInput.value = created_rangeInput.value;
      onchange(withOpacity(created_colorInput.value, created_rangeInput.value));
    });

    created_numberInput.addEventListener('change', () => {
      created_rangeInput.value = created_numberInput.value;
      onchange(withOpacity(created_colorInput.value, created_rangeInput.value));
    });

    onchange(color); // 최초 1회 실행해서 색상 초기화

    return created_container;
  }

  private createdColorEditorBox(
    color: string,
    onColorChange: (color: string) => void,
    strokeColor: string,
    onStrokeColorChange: (color: string) => void,
    shadowColor: string,
    onShadowColorChange: (color: string) => void,
  ): HTMLDivElement {
    const created_colorEditorBox = $create('div', 'input-editors');

    created_colorEditorBox.append(
      this.createColorInputItem('글씨 색상', color, onColorChange),
      this.createColorInputItem(
        '운곽선 색상',
        strokeColor,
        onStrokeColorChange,
      ),
      this.createColorWithOpacityInputItem(
        '그림자',
        shadowColor,
        onShadowColorChange,
      ),
    );

    return created_colorEditorBox;
  }
}
