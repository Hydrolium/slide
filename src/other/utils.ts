import type { SongInfo, SongInfoOnJSON } from "../types/song";

export const $createDiv = (text: string, ...classes: string[]) => {
  const element_div: HTMLDivElement = document.createElement('div');
  element_div.textContent = text;
  element_div.classList.add(...classes);

  return element_div;
};

export const $createSpan = (text: string, ...classes: string[]) => {
  const element_div: HTMLSpanElement = document.createElement('span');
  element_div.textContent = text;
  element_div.classList.add(...classes);

  return element_div;
};

export const $create = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  ...classes: string[]
): HTMLElementTagNameMap[K] => {
  const created = document.createElement(tag);
  if (classes.length > 0) created.classList.add(...classes);

  return created;
};

export const convertJSONtoSongInfo = (songInfoOnJson: SongInfoOnJSON) => {
  return {
    ...songInfoOnJson,
    texts: songInfoOnJson.texts.map((v) => {
      if (typeof v === 'string')
        return { title: songInfoOnJson.title, text: v };
      return { ...v };
    }),
  } as SongInfo;
};
