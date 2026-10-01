export type SongId = number;
export type SongRecord = Record<SongId, SongInfo>;
export type ImgName = string;
export type ImgRecord = Record<ImgName, ImageInfo>;

export interface ImageInfo {
  readonly file: File;
  readonly url: string;
}

export interface SongFrame {
  readonly title: string;
  readonly background: string;
  readonly titleColor: string;
  readonly titleStroke: string;
  readonly titleShadow: string;
  readonly textColor: string;
  readonly textStroke: string;
  readonly textShadow: string;
}

export interface TitltedText {
  readonly title: string;
  readonly text: string;
}

export interface SongInfo extends SongFrame {
  readonly texts: readonly TitltedText[];
}

export interface SongInfoOnJSON extends SongFrame {
  readonly texts: readonly (string | TitltedText)[];
}

export interface SongContext extends SongInfo {
  readonly textIdx: number;
}

export interface SongData extends SongInfo {
  readonly id: SongId;
}

export interface ModifiedSongData extends SongContext {
  readonly textIdx: number;
  readonly id: SongId;
}