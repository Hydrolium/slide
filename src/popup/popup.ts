import { $create } from '../other/utils';

import '../style/popup/popup.css';

const element_app = document.querySelector<HTMLDivElement>('#app');

export abstract class PopupGenerator<T> {
  private created_popupContainer: HTMLDivElement | null = null;
  private buttonList: HTMLButtonElement[] = [];

  private defered: PromiseWithResolvers<T | null> | null = null;

  protected abstract draw(element_popup: HTMLDivElement): void;

  protected addNegativeButton(text: string, onclick: (e: Event) => void): void {
    const created_button = $create('button', 'cancel-popup');
    created_button.textContent = text;
    created_button.addEventListener('click', onclick);
    this.buttonList.push(created_button);
  }

  protected addPositiveButton(text: string, onclick: (e: Event) => void): void {
    const created_button = $create('button', 'save-popup');
    created_button.textContent = text;
    created_button.addEventListener('click', onclick);
    this.buttonList.push(created_button);
  }

  public close(value?: T) {
    if (!this.defered) return;

    this.hide();
    this.defered.resolve(value ?? null);
  }

  private run(): Promise<T | null> {
    if (this.defered)
      return new Promise((_resolve, reject) => {
        reject('이미 실행된 팝업은 열 수 없습니다.');
      });

    this.buttonList = [];

    this.created_popupContainer = $create('div', 'popup-container');
    const created_popup = $create('div', 'popup');

    this.draw(created_popup);

    if (this.buttonList.length > 0) {
      const created_popupButtonBox = $create('div', 'popup-button-box');
      created_popupButtonBox.append(...this.buttonList);
      created_popup.append(created_popupButtonBox);
    }

    this.created_popupContainer.append(created_popup);

    element_app?.append(this.created_popupContainer);

    this.defered = Promise.withResolvers<T | null>();

    return this.defered.promise;
  }

  private hide(): void {
    if (this.created_popupContainer) {
      this.created_popupContainer.remove();
      this.created_popupContainer = null;
    }
  }

  public static async show<T, Args extends any[]>(
    this: new (...args: Args) => PopupGenerator<T>,
    ...args: Args
  ): Promise<T | null> {
    return (new (this as any)(...args) as PopupGenerator<T>).run();
  }
}
