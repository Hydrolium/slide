import { $createDiv } from './utils';
import type { SongContext } from '../types/song';
import { attachProperty } from './css_property_attacher';

import '../style/slide_style.css';

export class Slide {
  public static create(
    context: SongContext,
    backgroundUrl: string,
    isSelected: boolean,
  ) {
    const created_slideFrame = $createDiv('', 'slide-frame', 'small-box');

    const created_slideLayerContainer = $createDiv('', 'slide-layer-container');
    const created_slideLayer = $createDiv('', 'default-layer');

    const created_slideTitle = $createDiv(
      context.texts[context.textIdx].title,
      'slide-title',
    );
    const created_slideText = $createDiv(
      context.texts[context.textIdx].text,
      'slide-text',
    );

    created_slideFrame.classList.toggle('selected', isSelected);

    attachProperty(created_slideFrame, {
      titleColor: context.titleColor,
      titleStrokeColor: context.titleStroke,
      titleStrokeThickness: '1px',
      titleShadowColor: context.titleShadow,
      titleShadowOffset: '3px',

      textColor: context.textColor,
      textStrokeColor: context.textStroke,
      textStrokeThickness: '1px',
      textShadowColor: context.textShadow,
      textShadowOffset: '2px',

      defaultLayerImg: `url("${backgroundUrl}")`,
    });

    created_slideLayerContainer.append(created_slideLayer);

    created_slideFrame.append(
      created_slideLayerContainer,
      created_slideTitle,
      created_slideText,
    );

    return created_slideFrame;
  }
}
