import type { SplitedColor } from '../types/popup_data';
import type { SongInfo, SongInfoOnJSON } from '../types/song';

export function $create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  ...classes: string[]
): HTMLElementTagNameMap[K] {
  const created_ele = document.createElement(tag);
  if (classes.length > 0) created_ele.classList.add(...classes);

  return created_ele;
}

export function $createDiv(text: string, ...classes: string[]): HTMLDivElement {
  const created_div: HTMLDivElement = document.createElement('div');
  created_div.textContent = text;
  created_div.classList.add(...classes);

  return created_div;
}

export function $createSpan(
  text: string,
  ...classes: string[]
): HTMLSpanElement {
  const created_span: HTMLSpanElement = document.createElement('span');
  created_span.textContent = text;
  created_span.classList.add(...classes);

  return created_span;
}

export function $createCheckbox(...classes: string[]): HTMLInputElement {
  const created_checkbox: HTMLInputElement = document.createElement('input');
  created_checkbox.type = 'checkbox';
  created_checkbox.classList.add(...classes);

  return created_checkbox;
}

export function $createColorInput(color: string): HTMLInputElement {
  const created_input = $create('input');
  created_input.type = 'color';
  created_input.value = color;
  return created_input;
}

export function $createRangeInput(
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

export function $createNumberInput(
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

export function $createTextInput(value: string): HTMLInputElement {
  const created_textInput = $create('input');
  created_textInput.type = 'text';
  created_textInput.value = value;

  return created_textInput;
}

export function $createTextArea(
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

export function percentToHex(percent: string = '1'): string {
  return Math.round(((100 - Number(percent)) / 100) * 255)
    .toString(16)
    .padStart(2, '0');
}

export function hexToPercent(hex: string): string {
  return Math.round(100 - (parseInt(hex, 16) / 255) * 100).toString();
}

export function withOpacity(color: string, opacityPercent: string): string {
  return `${color}${percentToHex(opacityPercent)}`;
}

export function splitHex(hex: string): SplitedColor {
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
            .join(''),
        opacityPercent: '0',
      };
    case 5: // # X X X X
      return {
        color:
          '#' +
          Array.from(hex.slice(1, -1))
            .map((v) => v.repeat(2))
            .join(''),
        opacityPercent: hexToPercent(hex[4].repeat(2)),
      };
    case 7: // # XX XX XX
      return { color: hex, opacityPercent: '0' };
    case 9: // # XX XX XX XX
      return {
        color: hex.slice(0, -2),
        opacityPercent: hexToPercent(hex.slice(-2)),
      };
  }

  return { color: '#000', opacityPercent: '100' }; // 기본값(완전 투명)
}

export function convertJSONtoSongInfo(songInfoOnJson: SongInfoOnJSON) {
  return {
    ...songInfoOnJson,
    texts: songInfoOnJson.texts.map((v) => {
      if (typeof v === 'string')
        return { title: songInfoOnJson.title, text: v };
      return { ...v };
    }),
  } as SongInfo;
}

export function* mapNotNull<T, U>(
  array: readonly T[],
  callbackfn: (value: T, idx: number) => U,
) {
  const len = array.length;
  for (let i = 0; i < len; i++) {
    const transposed = callbackfn(array[i], i);
    if (transposed !== null && transposed !== undefined) yield transposed;
  }
}
