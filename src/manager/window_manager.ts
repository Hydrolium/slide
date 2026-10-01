import type { ContextType, ExtractedContext } from '../types/context';

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
