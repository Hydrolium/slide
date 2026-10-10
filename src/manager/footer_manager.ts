import { attachProperty } from '../other/css_property_attacher';
import { $create, $createDiv } from '../other/utils';

import '../style/footer.css';

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

    created_button.addEventListener('click', onclick);

    attachProperty(created_iconBackground, {
      footerIconMaskImg: `url("${svgSrc}")`,
    });

    created_button.append(created_iconBackground);
    created_menuButton.append(created_button, $createDiv(label));

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
    this.element_footer?.append(
      FooterManager.createFooterButton(label, svgSrc, onclick),
    );
  }
}
