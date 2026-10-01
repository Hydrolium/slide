import { EditorPopup } from './popup/editor_popup';
import { FileAdderPopup } from './popup/file_adder';
import { FileManagerPopup } from './popup/manage_file';
import { FileExportingOptionSetterPopup } from './popup/select_file_exporting_option_popup';
import { SlideAddingOptionSetterPopup } from './popup/select_slide_adding_option_popup';
import { SlideDeletingOptionSetterPopup } from './popup/select_slide_deleting_option_popup';
import { SettingEditorPopup } from './popup/setting_popup';
import { SlideSorterPopup } from './popup/sort_popup';
import { Slide } from './slide';
import { SongSetting, type SongContext } from './song_setting';
import { WindowManager } from './window_manager';
import { FooterManager } from './footer_manager';

import './style/slide_style.css';
import './style/slide_list.css';

export class SlideController {
  private readonly songSetting = new SongSetting();
  private readonly windowManager = new WindowManager();
  private readonly footerManager = new FooterManager();

  private element_slideBox =
    document.querySelector<HTMLUListElement>('#slide-box');

  private updateSong() {
    this.element_slideBox?.replaceChildren();

    if (this.songSetting.isEmpty()) {
      this.windowManager.sendToPopup('CLOSE');
      return;
    }

    this.songSetting.normalize();

    this.songSetting.order.forEach((id) => {
      const created_slide_li = document.createElement('li');
      created_slide_li.classList.add('slide-li');

      const song = this.songSetting.getSongWithId(id);

      if (!song) return;

      song.texts.forEach((_text, idx) => {
        const context: SongContext = {
          ...song,
          textIdx: idx,
        };

        const slide = new Slide(
          context,
          this.songSetting.imgUrls[song.background]?.url,
          id === this.songSetting.currentSongId &&
            idx === this.songSetting.currentTextIdx,
        ).render();

        slide.addEventListener('click', () => {
          this.songSetting.goto(id, idx);
          this.updateSong();
        });

        slide.addEventListener('contextmenu', async (event: MouseEvent) => {
          event.preventDefault();

          const result = await EditorPopup.show(
            { ...context, id: id, textIdx: idx },
            this.songSetting.imgUrls,
          );

          if (result) this.songSetting.modifySong(result);

          this.updateSong();
        });

        created_slide_li.appendChild(slide);
      });

      this.element_slideBox?.appendChild(created_slide_li);
    });

    this.windowManager.sendToPopup('CHANGE', this.songSetting.currentContext);
  }

  private initFooter() {
    this.footerManager.init();
    this.footerManager.addFooterButton(
      '파일추가',
      'imgs/footer_icons/add_file.svg',
      async () => {
        const result = await FileAdderPopup.show();

        if (result) await this.songSetting.loadFiles(result);

        this.windowManager.sendToPopup(
          'UPDATE_BACKGROUND',
          this.songSetting.imgUrls,
        );

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '파일관리',
      'imgs/footer_icons/manage_file.svg',
      async () => {
        const aboutJsonFile: Record<string, string> = {};
        Object.entries(this.songSetting.jsonFiles).forEach(
          ([fileName, data]) => {
            aboutJsonFile[fileName] = `${data.map((d) => d.title).join(', ')}`;
          },
        );

        const result = await FileManagerPopup.show(
          aboutJsonFile,
          this.songSetting.imgUrls,
        );
        if (result) this.songSetting.manageFile(result);

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '순서수정',
      'imgs/footer_icons/resort_slides.svg',
      async () => {
        const result = await SlideSorterPopup.show(
          this.songSetting.order,
          this.songSetting.songs,
        );
        if (result) this.songSetting.resortOrder(result);

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '추가하기',
      'imgs/footer_icons/add_slide.svg',
      async () => {
        if (this.songSetting.isEmpty()) {
          // 아무 노래도 없으면 그냥 노래 하나 추가
          this.songSetting.insertNewSongBeforeCurrent();
          this.updateSong();
          return;
        }

        const result = await SlideAddingOptionSetterPopup.show();

        switch (result) {
          case 'INSERT_LYRICS_BEFORE':
            this.songSetting.insertNewTextBeforeCurrent();
            break;
          case 'INSERT_LYRICS_AFTER':
            this.songSetting.insertNewTextAfterCurrent();
            break;
          case 'INSERT_SONG_BEFORE':
            this.songSetting.insertNewSongBeforeCurrent();
            break;
          case 'INSERT_SONG_AFTER':
            this.songSetting.insertNewSongAfterCurrent();
            break;
        }

        this.updateSong();
      },
    );

    this.footerManager.addFooterButton(
      '삭제하기',
      'imgs/footer_icons/delete_slide.svg',
      async () => {
        if (this.songSetting.isEmpty()) return; // 아무 노래도 없으면 삭제 x

        const result = await SlideDeletingOptionSetterPopup.show();
        console.log(result);
        switch (result) {
          case 'SELCTED_SONG':
            this.songSetting.deleteCurrentSong();
            break;
          case 'SELECTED_TEXT':
            this.songSetting.deleteCurrentText();
            break;
          case 'ALL':
            this.songSetting.initSong();
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
        this.songSetting.order.forEach((id) =>
          m.set(id, this.songSetting.songs[id].title),
        );

        const result = await FileExportingOptionSetterPopup.show(m);

        if (result === null) return;

        let downloadUrl;
        const link = document.createElement('a');

        if (result === FileExportingOptionSetterPopup.EXPORT_ALL) {
          downloadUrl = await this.songSetting.getExportAllLink();
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
          downloadUrl = await this.songSetting.getExportSongLink(result);
          link.href = downloadUrl;
          link.download = this.songSetting.songs[result].title ?? 'UNKNOWN';
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
          this.songSetting.titleFontSize,
          this.songSetting.textFontSize,
          (size: string) => {
            const conv = Number(size);
            this.songSetting.titleFontSize = conv;
            this.windowManager.sendToPopup('RESIZE_TITLE', conv);
          },
          (size: string) => {
            const conv = Number(size);
            this.songSetting.textFontSize = conv;
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
          this.songSetting.previous();
          this.updateSong();
          break;
        case 'ArrowRight':
          this.songSetting.next();
          this.updateSong();
          break;
      }
    });

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      switch (event.data) {
        case 'REQUEST_PREVIOUS':
          this.songSetting.previous();
          this.updateSong();
          break;
        case 'REQUEST_NEXT':
          this.songSetting.next();
          this.updateSong();
          break;
        case 'REQUEST_INITIALIZATION':
          this.windowManager.sendToPopup(
            'UPDATE_BACKGROUND',
            this.songSetting.imgUrls,
          );

          if (this.songSetting.isEmpty()) return;

          this.windowManager.sendToPopup(
            'RESIZE_TITLE',
            this.songSetting.titleFontSize,
          );
          this.windowManager.sendToPopup(
            'RESIZE_TEXT',
            this.songSetting.textFontSize,
          );
          this.windowManager.sendToPopup(
            'CHANGE',
            this.songSetting.currentContext,
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
