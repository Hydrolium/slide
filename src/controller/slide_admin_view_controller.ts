import { EditorPopup } from '../popup/editor_popup';
import { FileAdderPopup } from '../popup/file_adder';
import { FileManagerPopup } from '../popup/manage_file';
import { FileExportingOptionSetterPopup } from '../popup/select_file_exporting_option_popup';
import { SlideAddingOptionSetterPopup } from '../popup/select_slide_adding_option_popup';
import { SlideDeletingOptionSetterPopup } from '../popup/select_slide_deleting_option_popup';
import { SettingEditorPopup } from '../popup/setting_popup';
import { SlideSorterPopup } from '../popup/sort_popup';
import { Slide } from '../other/slide';
import { WindowManager } from '../manager/window_manager';
import { FooterManager } from '../manager/footer_manager';
import { SongManager } from '../manager/song_manager';
import type { SongContext, SongId, SongInfo } from '../types/song';
import { mapNotNull } from '../other/utils';

import '../style/slide_style.css';
import '../style/slide_list.css';

export class SlideAdminViewController {
  private readonly songManager = new SongManager();
  private readonly windowManager = new WindowManager();
  private readonly footerManager = new FooterManager();

  private static isInitialized = false;

  private constructor() {}

  public static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    new SlideAdminViewController().init();
  }

  private element_slideBox =
    document.querySelector<HTMLUListElement>('#slide-box');

  private makeSongSlideBox(song: SongInfo, id: SongId, textIdx: number) {
    const context: SongContext = {
      ...song,
      textIdx: textIdx,
    };

    const slide = Slide.create(
      context,
      this.songManager.imgUrls[song.background]?.url,
      id === this.songManager.currentSongId &&
        textIdx === this.songManager.currentTextIdx,
    );

    slide.addEventListener('click', () => {
      this.songManager.goto(id, textIdx);
      this.updateSong();
    });

    slide.addEventListener('contextmenu', async (event: MouseEvent) => {
      event.preventDefault();

      const result = await EditorPopup.show(
        { ...context, id: id, textIdx: textIdx },
        this.songManager.imgUrls,
      );

      if (result) this.songManager.modifySong(result);

      this.updateSong();
    });

    return slide;
  }

  private updateSong() {
    if (this.songManager.isEmpty()) {
      this.element_slideBox?.replaceChildren();
      this.windowManager.sendToPopup('CLOSE');
      return;
    }

    if (!this.element_slideBox) return;

    this.songManager.normalize();

    this.element_slideBox?.replaceChildren(
      ...mapNotNull(this.songManager.order, (id) => {
        const song = this.songManager.getSongWithId(id);
        if (!song) return;

        const created_slide_li = document.createElement('li');

        created_slide_li.classList.add('slide-li');

        created_slide_li.append(
          ...mapNotNull(song.texts, (_text, idx) =>
            this.makeSongSlideBox(song, id, idx),
          ),
        );

        return created_slide_li;
      }),
    );

    this.windowManager.sendToPopup('CHANGE', this.songManager.currentContext);
  }

  private initFooter() {
    this.footerManager.init();
    this.footerManager.addFooterButton(
      '파일추가',
      'imgs/footer_icons/add_file.svg',
      async () => {
        const result = await FileAdderPopup.show();

        if (result) await this.songManager.loadFiles(result);

        this.windowManager.sendToPopup(
          'UPDATE_BACKGROUND',
          this.songManager.imgUrls,
        );

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '파일관리',
      'imgs/footer_icons/manage_file.svg',
      async () => {
        const aboutJsonFile: Record<string, string> = {};

        for (const [fileName, data] of Object.entries(
          this.songManager.jsonFiles,
        ))
          aboutJsonFile[fileName] = `${data.map((d) => d.title).join(', ')}`;

        const result = await FileManagerPopup.show(
          aboutJsonFile,
          this.songManager.imgUrls,
        );
        if (result) this.songManager.manageFile(result);

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '순서수정',
      'imgs/footer_icons/resort_slides.svg',
      async () => {
        const result = await SlideSorterPopup.show(
          this.songManager.order,
          this.songManager.songs,
        );
        if (result) this.songManager.resortOrder(result);

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '추가하기',
      'imgs/footer_icons/add_slide.svg',
      async () => {
        if (this.songManager.isEmpty()) {
          // 아무 노래도 없으면 그냥 노래 하나 추가
          this.songManager.insertNewSongBeforeCurrent();
          this.updateSong();
          return;
        }

        const result = await SlideAddingOptionSetterPopup.show();

        switch (result) {
          case 'INSERT_LYRICS_BEFORE':
            this.songManager.insertNewTextBeforeCurrent();
            break;
          case 'INSERT_LYRICS_AFTER':
            this.songManager.insertNewTextAfterCurrent();
            break;
          case 'INSERT_SONG_BEFORE':
            this.songManager.insertNewSongBeforeCurrent();
            break;
          case 'INSERT_SONG_AFTER':
            this.songManager.insertNewSongAfterCurrent();
            break;
        }

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '삭제하기',
      'imgs/footer_icons/delete_slide.svg',
      async () => {
        if (this.songManager.isEmpty()) return; // 아무 노래도 없으면 삭제 x

        const result = await SlideDeletingOptionSetterPopup.show();
        console.log(result);
        switch (result) {
          case 'SELCTED_SONG':
            this.songManager.deleteCurrentSong();
            break;
          case 'SELECTED_TEXT':
            this.songManager.deleteCurrentText();
            break;
          case 'ALL':
            this.songManager.initSong();
            break;
        }

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '내보내기',
      'imgs/footer_icons/export_slides.svg',
      async () => {
        const m = new Map<number, string>();
        for (const id of this.songManager.order)
          m.set(id, this.songManager.songs[id].title);

        const result = await FileExportingOptionSetterPopup.show(m);

        if (result === null) return;

        let downloadUrl;
        const link = document.createElement('a');

        if (result === FileExportingOptionSetterPopup.EXPORT_ALL) {
          downloadUrl = await this.songManager.getExportAllLink();
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
          downloadUrl = await this.songManager.getExportSongLink(result);
          link.href = downloadUrl;
          link.download = this.songManager.songs[result].title ?? 'UNKNOWN';
        }

        link.click();

        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 100);
      },
    );

    this.footerManager.addFooterButton(
      '전체화면',
      'imgs/footer_icons/open_viewer.svg',
      () => {
        this.windowManager.openShow();
      },
    );

    this.footerManager.addFooterButton(
      '설정변경',
      'imgs/footer_icons/edit_setting.svg',
      () => {
        SettingEditorPopup.show(
          this.songManager.titleFontSize,
          this.songManager.textFontSize,
          (size: string) => {
            const conv = Number(size);
            this.songManager.titleFontSize = conv;
            this.windowManager.sendToPopup('RESIZE_TITLE', conv);
          },
          (size: string) => {
            const conv = Number(size);
            this.songManager.textFontSize = conv;
            this.windowManager.sendToPopup('RESIZE_TEXT', conv);
          },
        );
      },
    );
  }

  private initEvent() {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA'].includes(event.target.tagName)
      )
        return;

      switch (event.key) {
        case 'ArrowLeft':
          this.songManager.previous();
          this.updateSong();
          break;
        case 'ArrowRight':
          this.songManager.next();
          this.updateSong();
          break;
      }
    });

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      switch (event.data) {
        case 'REQUEST_PREVIOUS':
          this.songManager.previous();
          this.updateSong();
          break;
        case 'REQUEST_NEXT':
          this.songManager.next();
          this.updateSong();
          break;
        case 'REQUEST_INITIALIZATION':
          this.windowManager.sendToPopup(
            'UPDATE_BACKGROUND',
            this.songManager.imgUrls,
          );

          if (this.songManager.isEmpty()) return;

          this.windowManager.sendToPopup(
            'RESIZE_TITLE',
            this.songManager.titleFontSize,
          );
          this.windowManager.sendToPopup(
            'RESIZE_TEXT',
            this.songManager.textFontSize,
          );
          this.windowManager.sendToPopup(
            'CHANGE',
            this.songManager.currentContext,
          );
          break;
      }
    });
  }

  public init() {
    this.initFooter();
    this.initEvent();
  }
}
