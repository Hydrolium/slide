import { $create, $createDiv } from '../other/utils';
import { PopupGenerator } from './popup';
import { ImgSelectorPopup } from './select_img_popup';
import type { ImgRecord, ModifiedSongData } from '../types/song';
import type { SplitedColor } from '../types/popup_data';
import { attachProperty } from '../other/css_property_attacher';

import '../style/slide_style.css';
import '../style/popup/slide_editor.css';

export class EditorPopup extends PopupGenerator<ModifiedSongData> {
  private readonly songData: Mutable<ModifiedSongData>;
  private readonly imgs: Readonly<ImgRecord>;

  constructor(songData: ModifiedSongData, imgs: Readonly<ImgRecord>) {
    super();
    this.songData = { ...songData, texts: [...songData.texts] };
    this.imgs = imgs;
  }

  private static createColorInput(color: string): HTMLInputElement {
    const created_input = $create('input');
    created_input.type = 'color';
    created_input.value = color;
    return created_input;
  }

  private static createRangeInput(
    value: string,
    min: string = '0',
    max: string = '100',
    step: string = '1',
  ): HTMLInputElement {
    const created_rangeInput = $create('input');
    created_rangeInput.type = 'range';
    created_rangeInput.value = value;
    created_rangeInput.min = min;
    created_rangeInput.max = max;
    created_rangeInput.step = step;

    return created_rangeInput;
  }

  private static createNumberInput(
    value: string,
    min: string = '0',
    max: string = '100',
    step: string = '1',
  ): HTMLInputElement {
    const created_numberInput = $create('input');
    created_numberInput.type = 'number';
    created_numberInput.value = value;
    created_numberInput.min = min;
    created_numberInput.max = max;
    created_numberInput.step = step;

    return created_numberInput;
  }

  private static createTextInput(value: string): HTMLInputElement {
    const created_textInput = $create('input');
    created_textInput.type = 'text';
    created_textInput.value = value;

    return created_textInput;
  }

  private static createTextArea(
    value: string,
    rows = 4,
    cols = 10,
  ): HTMLTextAreaElement {
    const created_textarea = $create('textarea');
    created_textarea.value = value;
    created_textarea.rows = rows;
    created_textarea.cols = cols;

    return created_textarea;
  }

  private static createColorInputItem(
    label: string,
    color: string,
    onchange: (color: string) => void,
  ): HTMLDivElement {
    const created_inputEditor = $create('div', 'input-editor');

    created_inputEditor.appendChild($createDiv(label, 'input-editor-label'));

    const created_input = this.createColorInput(color);
    created_input.onchange = () => onchange(created_input.value);

    created_inputEditor.appendChild(created_input);

    onchange(color); // 최초 1회 실행해서 색상 초기화

    return created_inputEditor;
  }

  private static percentToHex(percent: string = '1'): string {
    return Math.round(((100 - Number(percent)) / 100) * 255)
      .toString(16)
      .padStart(2, '0');
  }

  private static hexToPercent(hex: string): string {
    return Math.round(100 - (parseInt(hex, 16) / 255) * 100).toString();
  }

  private static withOpacity(color: string, opacityPercent: string): string {
    return `${color}${this.percentToHex(opacityPercent)}`;
  }

  private static splitHex(hex: string): SplitedColor {
    if (!hex.startsWith('#'))
      // hex code 형식이 아님.
      return { color: '#000', opacityPercent: '100' };

    switch (hex.length) {
      case 4: // # X X X
        return {
          color:
            '#' +
            Array.from(hex.slice(1))
              .map((v) => v.repeat(2))
              .join(),
          opacityPercent: '0',
        };
      case 5: // # X X X X
        return {
          color:
            '#' +
            Array.from(hex.slice(1, -1))
              .map((v) => v.repeat(2))
              .join(),
          opacityPercent: this.hexToPercent(hex[4].repeat(2)),
        };
      case 7: // # XX XX XX
        return { color: hex, opacityPercent: '0' };
      case 9: // # XX XX XX XX
        return {
          color: hex.slice(0, -2),
          opacityPercent: this.hexToPercent(hex.slice(-2)),
        };
    }

    return { color: '#000', opacityPercent: '100' }; // 기본값(완전 투명)
  }

  private static createColorWithOpacityInputItem(
    label: string,
    color: string,
    onchange: (color: string) => void,
  ): DocumentFragment {
    const splitedColor = this.splitHex(color);

    const created_container = document.createDocumentFragment();

    const created_colorInputEditor = $create('div', 'input-editor');

    const created_colorInput = this.createColorInput(splitedColor.color);

    created_colorInputEditor.append(
      $createDiv(label + ' 색상', 'input-editor-label'),
      created_colorInput,
    );

    const created_opacityInputEditor = $create('div', 'input-editor');

    const created_rangeInput = this.createRangeInput(
      splitedColor.opacityPercent,
    );
    const created_numberInput = this.createNumberInput(
      splitedColor.opacityPercent,
    );

    created_opacityInputEditor.append(
      $createDiv(label + ' 투명도', 'input-editor-label'),
      created_rangeInput,
      created_numberInput,
    );

    created_container.append(
      created_colorInputEditor,
      created_opacityInputEditor,
    );

    created_colorInput.onchange = () =>
      onchange(
        this.withOpacity(created_colorInput.value, created_rangeInput.value),
      );

    created_rangeInput.onchange = () => {
      created_numberInput.value = created_rangeInput.value;
      onchange(
        this.withOpacity(created_colorInput.value, created_rangeInput.value),
      );
    };

    created_numberInput.onchange = () => {
      created_rangeInput.value = created_numberInput.value;
      onchange(
        this.withOpacity(created_colorInput.value, created_rangeInput.value),
      );
    };

    onchange(color); // 최초 1회 실행해서 색상 초기화

    return created_container;
  }

  private static createdColorEditorBox(
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

    const created_titleInput = EditorPopup.createTextInput('');
    const created_textArea = EditorPopup.createTextArea('');

    const created_backgroundChangeButton = $create('button');
    const created_titleColorEditorBox = EditorPopup.createdColorEditorBox(
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
    const created_textColorEditorBox = EditorPopup.createdColorEditorBox(
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
      defaultLayerImg: `url(${this.imgs[this.songData.background]?.url})`,
    });

    created_titleInput.classList.add('slide-title');
    created_titleInput.value = this.songData.texts[this.songData.textIdx].title;
    created_titleInput.onchange = () => {
      this.songData.texts[this.songData.textIdx].title =
        created_titleInput.value;
    };

    created_textArea.classList.add('slide-text');
    created_textArea.value = this.songData.texts[this.songData.textIdx].text;
    created_textArea.onchange = () => {
      this.songData.texts[this.songData.textIdx].text = created_textArea.value;
    };

    created_backgroundChangeButton.textContent = '배경 변경';
    created_backgroundChangeButton.classList.add('background-change-button');
    created_backgroundChangeButton.onclick = async () => {
      const result = await ImgSelectorPopup.show(this.imgs);
      if (result) {
        const url = this.imgs[result].url;
        created_slideInputFrame.style.backgroundImage = `url(${url})`;
        this.songData.background = result;
      }
    };

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
}
