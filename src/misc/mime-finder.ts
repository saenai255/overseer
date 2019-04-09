import mime from "./MimeTypes.json";


export default class MimeFinder {
  private readonly mimeTypes: any;

  constructor() {
    this.mimeTypes = mime;
  }

  public getMimeType(extension: string): string {
    return this.mimeTypes[extension];
  }
}
