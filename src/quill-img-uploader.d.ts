declare module 'quill-image-uploader' {
  import { Quill } from 'react-quill';

  export interface ImageUploaderOptions {
    upload: (file: File) => Promise<string>;
  }

  export default class ImageUploader {
    constructor(quill: Quill, options: ImageUploaderOptions);
  }
}
