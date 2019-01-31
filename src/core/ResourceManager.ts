import fs from "fs";
import {ServerResponse} from "http";
import MimeFinder from "../misc/MimeFinder";
import path from 'path';
import logger from "../misc/Logger";

export default class ResourceManager {

  constructor(private readonly resourcePath: string, private mimeFinder: MimeFinder) {
    this.resourcePath = path.join(resourcePath, '/../resources');

    if(!fs.existsSync(this.resourcePath)) {
      throw new Error('Resources directory not found. It should be ' + this.resourcePath);
    }
    
    logger.info(this, 'Resources directory set in {}', this.resourcePath);
  }

  public fileExists(url: string): boolean {
    const p = path.join(this.resourcePath, url);
    if(!fs.existsSync(p)) {
      return false;
    }

    let stat = fs.lstatSync(p);
    if(stat.isFile()) {
      return true;
    }

    if(!fs.existsSync(path.join(p, 'index.html'))) {
      return false;
    }

    stat = fs.lstatSync(path.join(p, 'index.html'));
    return stat.isFile();
  }

  public handleRequest(baseUrl: string, res: ServerResponse): void {
    const url = fs.lstatSync(path.join(this.resourcePath, baseUrl)).isFile() ? baseUrl : baseUrl + '/index.html';
    const data = url.split(".");
    const extension = "." + data[data.length - 1];

    const stat = fs.statSync(path.join(this.resourcePath, url));

    res.writeHead(200, {
      'Content-Type': this.mimeFinder.getMimeType(extension),
      'Content-Length': stat.size
    });
    const readStream = fs.createReadStream(path.join(this.resourcePath, url));
    readStream.pipe(res);
  }
}
