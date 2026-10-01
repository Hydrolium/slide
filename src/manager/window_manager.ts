import type { ImageInfo, SongContext } from "../types/song";

interface ClosingContext {
  type: 'CLOSE';
  data: null;
}

interface ResizingTitleContext {
  type: 'RESIZE_TITLE';
  data: number;
}

interface ResizingTextContext {
  type: 'RESIZE_TEXT';
  data: number;
}

interface UpdatingBackgroundContext {
  type: 'UPDATE_BACKGROUND';
  data: Readonly<Record<string, ImageInfo>>;
}

interface ChangingContext {
  type: 'CHANGE';
  data: SongContext | null;
}

type ContextType =
  | ClosingContext
  | ResizingTitleContext
  | ResizingTextContext
  | UpdatingBackgroundContext
  | ChangingContext;

type ExtractedContext<K extends ContextType['type']> = Extract<
  ContextType,
  { type: K }
>;

export class WindowManager {
  private slideShowWindow: Window | null = null;

  public sendToPopup<K extends ContextType['type']>(
    type: K,
    data?: ExtractedContext<K>['data'],
  ) {
    if (this.slideShowWindow && !this.slideShowWindow.closed) {
      this.slideShowWindow.postMessage(
        { type: type, data: data },
        window.location.origin,
      );
    }
  }

  public openShow() {
    if (this.slideShowWindow) this.slideShowWindow.close();

    this.slideShowWindow = window.open(
      'slide_show.html',
      'MyPopup',
      'width=500,height=600',
    );
  }
}
