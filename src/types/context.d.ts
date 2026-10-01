interface ClosingContext {
  type: 'CLOSE';
  data: null;
}

interface ResizingTitleContext {
  type: 'RESIZE_TITLE';
  data: number;
}

interface ResizingTextContext {
  type: 'RESIZE_TEXT';
  data: number;
}

interface UpdatingBackgroundContext {
  type: 'UPDATE_BACKGROUND';
  data: Readonly<ImgRecord>;
}

interface ChangingContext {
  type: 'CHANGE';
  data: SongContext | null;
}

export type ContextType =
  | ClosingContext
  | ResizingTitleContext
  | ResizingTextContext
  | UpdatingBackgroundContext
  | ChangingContext;

export type ExtractedContext<K extends ContextType['type']> = Extract<
  ContextType,
  { type: K }
>;
