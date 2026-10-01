export type SlideDeletingOption = 'SELCTED_SONG' | 'SELECTED_TEXT' | 'ALL';
export type SlideAddingOption =
  | 'INSERT_LYRICS_BEFORE'
  | 'INSERT_LYRICS_AFTER'
  | 'INSERT_SONG_BEFORE'
  | 'INSERT_SONG_AFTER';

export type FileDeletingOption = 'ONLY_FILE' | 'CASCADE';

export interface ManagementResult {
  readonly removedImgs: Set<string>; // 삭제된 이미지 이름 set
  readonly removedJsons: Record<string, FileDeletingOption>; // key: 삭제된 json 파일 이름, value: 삭제 옵션
  readonly refreshedJsons: Set<string>; // 새로고침된 json 파일 이름 set
}

export interface SplitedColor {
  readonly color: string;
  readonly opacityPercent: string;
}