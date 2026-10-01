import { Slide } from './slide';
import { SlideSorterPopup } from './popup/sort_popup';
import { SongSetting, type SongContext } from './song_setting';
import { FileManagerPopup } from './popup/manage_file';
import { addFooterButton } from './footer';
import { FileAdderPopup } from './popup/file_adder';
import { SettingEditorPopup } from './popup/setting_popup';
import { EditorPopup } from './popup/editor_popup';
import { SlideAddingOptionSetterPopup } from './popup/select_slide_adding_option_popup';
import { SlideDeletingOptionSetterPopup } from './popup/select_slide_deleting_option_popup';
import { FileExportingOptionSetterPopup } from './popup/select_file_exporting_option_popup';

import './style/slide_style.css';
import './style/slide_list.css';
import { WindowManager } from './window_manager';

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

const songSetting = new SongSetting();
const windowManager = new WindowManager();

const element_slideBox = document.querySelector<HTMLUListElement>('#slide-box');

const updateSong = () => {
  element_slideBox?.replaceChildren();

  if (songSetting.isEmpty()) {
    windowManager.sendToPopup('CLOSE');
    return;
  }

  songSetting.normalize();

  songSetting.order.forEach((id) => {
    const created_slide_li = document.createElement('li');
    created_slide_li.classList.add('slide-li');

    const song = songSetting.getSongWithId(id);

    if (!song) return;

    song.texts.forEach((_text, idx) => {
      const context: SongContext = {
        ...song,
        textIdx: idx,
      };

      const slide = new Slide(
        context,
        songSetting.imgUrls[song.background]?.url,
        id === songSetting.currentSongId && idx === songSetting.currentTextIdx,
      ).render();

      slide.addEventListener('click', () => {
        songSetting.goto(id, idx);
        updateSong();
      });

      slide.addEventListener('contextmenu', async (event: MouseEvent) => {
        event.preventDefault();

        const result = await EditorPopup.show(
          { ...context, id: id, textIdx: idx },
          songSetting.imgUrls,
        );

        if (result) songSetting.modifySong(result);

        updateSong();
      });

      created_slide_li.appendChild(slide);
    });

    element_slideBox?.appendChild(created_slide_li);
  });

  windowManager.sendToPopup('CHANGE', songSetting.currentContext);
};

const resizeTitle = (pixel: string) => {
  const conv = Number(pixel);
  songSetting.titleFontSize = conv;
  windowManager.sendToPopup('RESIZE_TITLE', conv);
};

const resizeText = (pixel: string) => {
  const conv = Number(pixel);
  songSetting.textFontSize = conv;
  windowManager.sendToPopup('RESIZE_TEXT', conv);
};

addFooterButton('파일추가', 'imgs/footer_icons/add_file.svg', async () => {
  const result = await FileAdderPopup.show();

  if (result) await songSetting.loadFiles(result);

  windowManager.sendToPopup('UPDATE_BACKGROUND', songSetting.imgUrls);

  updateSong();
});

addFooterButton('파일관리', 'imgs/footer_icons/manage_file.svg', async () => {
  const aboutJsonFile: Record<string, string> = {};
  Object.entries(songSetting.jsonFiles).forEach(([fileName, data]) => {
    aboutJsonFile[fileName] = `${data.map((d) => d.title).join(', ')}`;
  });

  const result = await FileManagerPopup.show(
    aboutJsonFile,
    songSetting.imgUrls,
  );
  if (result) songSetting.manageFile(result);

  updateSong();
});

addFooterButton('순서수정', 'imgs/footer_icons/resort_slides.svg', async () => {
  const result = await SlideSorterPopup.show(
    songSetting.order,
    songSetting.songs,
  );
  if (result) songSetting.resortOrder(result);

  updateSong();
});

addFooterButton('추가하기', 'imgs/footer_icons/add_slide.svg', async () => {
  if (songSetting.isEmpty()) {
    // 아무 노래도 없으면 그냥 노래 하나 추가
    songSetting.insertNewSongBeforeCurrent();
    updateSong();
    return;
  }

  const result = await SlideAddingOptionSetterPopup.show();

  switch (result) {
    case 'INSERT_LYRICS_BEFORE':
      songSetting.insertNewTextBeforeCurrent();
      break;
    case 'INSERT_LYRICS_AFTER':
      songSetting.insertNewTextAfterCurrent();
      break;
    case 'INSERT_SONG_BEFORE':
      songSetting.insertNewSongBeforeCurrent();
      break;
    case 'INSERT_SONG_AFTER':
      songSetting.insertNewSongAfterCurrent();
      break;
  }

  updateSong();
});

addFooterButton('삭제하기', 'imgs/footer_icons/delete_slide.svg', async () => {
  if (songSetting.isEmpty()) return; // 아무 노래도 없으면 삭제 x

  const result = await SlideDeletingOptionSetterPopup.show();
  console.log(result);
  switch (result) {
    case 'SELCTED_SONG':
      songSetting.deleteCurrentSong();
      break;
    case 'SELECTED_TEXT':
      songSetting.deleteCurrentText();
      break;
    case 'ALL':
      songSetting.initSong();
      break;
  }

  updateSong();
});

addFooterButton('내보내기', 'imgs/footer_icons/export_slides.svg', async () => {
  const m = new Map<number, string>();
  songSetting.order.forEach((id) => m.set(id, songSetting.songs[id].title));

  const result = await FileExportingOptionSetterPopup.show(m);

  if (result === null) return;

  let downloadUrl;
  const link = document.createElement('a');

  if (result === FileExportingOptionSetterPopup.EXPORT_ALL) {
    downloadUrl = await songSetting.getExportAllLink();
    link.href = downloadUrl;
    link.download =
      new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
        .format(new Date())
        .replace(/\.$/, '') + '.zip';
  } else {
    downloadUrl = await songSetting.getExportSongLink(result);
    link.href = downloadUrl;
    link.download = songSetting.songs[result].title ?? 'UNKNOWN';
  }

  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 100);
});

addFooterButton('전체화면', 'imgs/footer_icons/open_viewer.svg', () => {
  windowManager.openShow();
});

addFooterButton('설정변경', 'imgs/footer_icons/edit_setting.svg', () => {
  SettingEditorPopup.show(
    songSetting.titleFontSize,
    songSetting.textFontSize,
    resizeTitle,
    resizeText,
  );
});

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (
    event.target instanceof HTMLElement &&
    ['INPUT', 'TEXTAREA'].includes(event.target.tagName)
  )
    return;

  switch (event.key) {
    case 'ArrowLeft':
      songSetting.previous();
      updateSong();
      break;
    case 'ArrowRight':
      songSetting.next();
      updateSong();
      break;
  }
});

window.addEventListener('message', (event: MessageEvent) => {
  if (event.origin !== window.location.origin) return;

  switch (event.data) {
    case 'REQUEST_PREVIOUS':
      songSetting.previous();
      updateSong();
      break;
    case 'REQUEST_NEXT':
      songSetting.next();
      updateSong();
      break;
    case 'REQUEST_INITIALIZATION':
      windowManager.sendToPopup('UPDATE_BACKGROUND', songSetting.imgUrls);

      if (songSetting.isEmpty()) return;

      windowManager.sendToPopup('RESIZE_TITLE', songSetting.titleFontSize);
      windowManager.sendToPopup('RESIZE_TEXT', songSetting.textFontSize);
      windowManager.sendToPopup('CHANGE', songSetting.currentContext);
      break;
  }
});
