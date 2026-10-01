import { $create, $createDiv } from '../other/utils';

import './style/footer.css';

export class FooterManager {
  private readonly element_footer =
    document.querySelector<HTMLDivElement>('#footer');
  private static createFooterButton(
    label: string,
    svgSrc: string,
    onclick: (e: Event) => void,
  ) {
    const created_menuButton = $create('div', 'menu-button');

    const created_button = $create('button');

    const created_iconBackground = $create('span', 'icon-background');

    created_iconBackground.style.webkitMaskImage = `url(${svgSrc})`;
    created_iconBackground.style.maskImage = `url(${svgSrc})`;
    created_button.appendChild(created_iconBackground);
    created_menuButton.appendChild(created_button);

    created_menuButton.appendChild($createDiv(label));

    created_menuButton.onclick = onclick;

    return created_menuButton;
  }

  public init() {
    this.element_footer?.replaceChildren();
  }

  public addFooterButton(
    label: string,
    svgSrc: string,
    onclick: (e: Event) => void,
  ) {
    this.element_footer?.appendChild(
      FooterManager.createFooterButton(label, svgSrc, onclick),
    );
  }
}
