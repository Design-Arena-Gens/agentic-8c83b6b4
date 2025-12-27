declare module 'pdf-parse/lib/pdf-parse.js' {
  import type PdfParse from 'pdf-parse';

  const parse: (dataBuffer: Buffer, options?: PdfParse.Options) => Promise<PdfParse.Result>;

  export = parse;
}
