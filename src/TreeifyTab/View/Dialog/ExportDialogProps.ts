export type ExportDialogProps = {}

export function createExportDialogProps(): ExportDialogProps {
  return {}
}

/** .svelte内で定義したらなぜかエラーが出たので.ts内で定義する */
export enum Format {
  PLAIN_TEXT,
  MARKDOWN,
  OPML,
}
