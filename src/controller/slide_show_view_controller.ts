import { $createDiv } from '../other/utils';
import type { ImgRecord, SongContext } from '../types/song';

import '../style/slide_style.css';

export class SlideShowViewController {
  private readonly element_slideLayerContainer =
    document.querySelector<HTMLDivElement>('#slide-layer-container');
  private readonly element_slideTitle =
    document.querySelector<HTMLDivElement>('#slide-title');
  private readonly element_slideText =
    document.querySelector<HTMLDivElement>('#slide-text');

  private cachedLayers: Record<string, HTMLDivElement> = {};
  private currentLayerName = '';

  private static isInitialized = false;

  private constructor() {}

  public static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    new SlideShowViewController().init();
  }

  private updateBackground(newBackgroundName: string) {
    if (newBackgroundName !== this.currentLayerName) {
      const layer = this.cachedLayers[newBackgroundName];
      const currentLayer = this.cachedLayers[this.currentLayerName];

      if (currentLayer) currentLayer.classList.remove('visible');
      if (layer) layer.classList.add('visible');

      this.currentLayerName = newBackgroundName;
    }
  }

  private update(context: SongContext) {
    if (
      !this.element_slideLayerContainer ||
      !this.element_slideTitle ||
      !this.element_slideText
    )
      return;

    this.updateBackground(context.background);

    this.element_slideTitle.textContent = context.texts[context.textIdx].title;
    this.element_slideTitle.style.color = context.titleColor;
    this.element_slideTitle.style.webkitTextStroke = `4px ${context.titleStroke}`;
    this.element_slideTitle.style.textShadow = `8px 8px 0 ${context.titleShadow}`;

    this.element_slideText.textContent = context.texts[context.textIdx].text;
    this.element_slideText.style.color = context.textColor;
    this.element_slideText.style.webkitTextStroke = `3px ${context.textStroke}`;
    this.element_slideText.style.textShadow = `7px 7px 0 ${context.textShadow}`;
  }

  private initEvent() {
    window.addEventListener('message', (event: MessageEvent) => {
      const data = event.data;

      if (data.type == 'CHANGE' && data.data) {
        this.update(data.data);
      } else if (data.type == 'CLOSE') {
        window.close();
      } else if (data.type == 'RESIZE_TITLE') {
        if (this.element_slideTitle)
          this.element_slideTitle.style.fontSize = `${data.data}vw`;
      } else if (data.type == 'RESIZE_TEXT') {
        if (this.element_slideText)
          this.element_slideText.style.fontSize = `${data.data}vw`;
      } else if (data.type == 'UPDATE_BACKGROUND') {
        if (!this.element_slideLayerContainer) return;

        this.cachedLayers = {};
        const layers = [$createDiv('', 'default_layer')];

        for (const [name, info] of Object.entries(data.data as ImgRecord)) {
          const created_layer = $createDiv('', 'slide-layer');

          created_layer.style.backgroundImage = `url(${info.url})`;

          this.cachedLayers[name] = created_layer;
          layers.push(created_layer);
        }
        this.element_slideLayerContainer.replaceChildren(...layers);

        const temp = this.currentLayerName;
        this.currentLayerName = '';
        this.updateBackground(temp);
      }
    });

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          window.opener.postMessage('REQUEST_PREVIOUS', window.location.origin);
          break;
        case 'ArrowRight':
          window.opener.postMessage('REQUEST_NEXT', window.location.origin);
          break;
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      window.opener.postMessage(
        'REQUEST_INITIALIZATION',
        window.location.origin,
      );
    });
  }

  private init() {
    this.initEvent();
  }
}
