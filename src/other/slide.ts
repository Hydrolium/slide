import type { SongContext } from '../types/song';
import { $createDiv } from './utils';

export class Slide {
  private element_frame: HTMLDivElement = $createDiv(
    '',
    'slide-frame',
    'small-box',
  );

  constructor(
    context: SongContext,
    backgroundUrl: string,
    isSelected: boolean,
  ) {
    const created_slideLayer = $createDiv('', 'slide-layer', 'visible');
    const created_slideLayerContainer = $createDiv('', 'slide-layer-container');
    const created_slideTitle = $createDiv(
      context.texts[context.textIdx].title,
      'slide-title',
    );
    const created_slideText = $createDiv(
      context.texts[context.textIdx].text,
      'slide-text',
    );

    created_slideLayer.style.backgroundImage = `url(${backgroundUrl})`;

    created_slideTitle.style.color = context.titleColor;
    created_slideTitle.style.webkitTextStroke = `1px ${context.titleStroke}`;
    created_slideTitle.style.textShadow = `3px 3px 0 ${context.titleShadow}`;

    created_slideText.style.color = context.textColor;
    created_slideText.style.webkitTextStroke = `1px ${context.textStroke}`;
    created_slideText.style.textShadow = `2px 2px 0 ${context.textShadow}`;

    created_slideLayerContainer.append(created_slideLayer);

    this.element_frame.replaceChildren(
      created_slideLayerContainer,
      created_slideTitle,
      created_slideText,
    );

    this.element_frame.classList.toggle('selected', isSelected);
  }

  render(): HTMLDivElement {
    return this.element_frame;
  }
}
