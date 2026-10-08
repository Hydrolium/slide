const CssVars = {
  titleColor: '--title-color',
  titleStrokeColor: '--title-stroke-color',
  titleStrokeThickness: '--title-stroke-thickness',
  titleShadowColor: '--title-shadow-color',
  titleShadowOffset: '--title-shadow-offset',
  titleFontSize: '--title-font-size',

  textColor: '--text-color',
  textStrokeColor: '--text-stroke-color',
  textStrokeThickness: '--text-stroke-thickness',
  textShadowColor: '--text-shadow-color',
  textShadowOffset: '--text-shadow-offset',
  textFontSize: '--text-font-size',

  defaultLayerImg: '--default-layer-img',

  slideLayerImg: '--slide-layer-img',

  footerIconMaskImg: '--footer-icon-mask-img',
} as const;

export const attachProperty = (
  element: HTMLElement,
  property: Readonly<Partial<Record<keyof typeof CssVars, string>>>,
) => {
  for (const [key, value] of Object.entries(property))
    element.style.setProperty(CssVars[key as keyof typeof CssVars], value);
};
