import fs from "fs";
import {ServerResponse} from "http";
import MimeFinder from "../misc/MimeFinder";
import path from 'path';
import logger from "../misc/Logger";
import { promisify } from "util";

export default class Resources {
  private static readonly BASE_RELATIVE_RESOURCES_DIRECTORY =  '../resources';
  private static readonly RESOURCES_RELATIVE_PUBLIC_DIRECTORY =  './public';

  private resourceDirectory: string;
  private publicDirectory: string;

  constructor(private readonly basePath: string, private mimeFinder: MimeFinder) {
    this.resourceDirectory = path.join(basePath, Resources.BASE_RELATIVE_RESOURCES_DIRECTORY);
    this.publicDirectory = path.join(this.resourceDirectory, Resources.RESOURCES_RELATIVE_PUBLIC_DIRECTORY);

    if(!fs.existsSync(this.resourceDirectory)) {
      throw new Error('Resources directory not found. It should be ' + this.resourceDirectory);
    }

    if(!fs.existsSync(this.publicDirectory)) {
      throw new Error('Public resources directory not found. It should be ' + this.resourceDirectory);
    }
    
    logger.info(this, 'Resources directory set in {}', this.resourceDirectory);
  }

  public fileExists(relativePath: string): boolean {
    const p = path.join(this.resourceDirectory, relativePath);
    if(!fs.existsSync(p)) {
      return false;
    }

    return fs.lstatSync(p).isFile();
  }

  public fileOrIndexExists(relativePath: string): boolean {
    const p = path.join(this.resourceDirectory, relativePath);
    if(!this.fileExists(relativePath)) {
      return false;
    } 
    
    if(!fs.existsSync(path.join(p, 'index.html'))) {
      return false;
    }
    
    return fs.lstatSync(path.join(p, 'index.html')).isFile();
  }

  public async readFile(relativePath: string): Promise<Buffer> {
    if(!this.fileExists(relativePath)) {
      throw new Error(`File ${relativePath} does not exist`);
    }

    return await promisify(fs.readFile)(path.join(Resources.BASE_RELATIVE_RESOURCES_DIRECTORY, relativePath));
  }

  public handleRequest(baseUrl: string, res: ServerResponse): void {
    const url = fs.lstatSync(path.join( this.resourceDirectory, baseUrl)).isFile() ? baseUrl : path.join(baseUrl, 'index.html');
    const data = url.split(".");
    const extension = "." + data[data.length - 1];

    const stat = fs.statSync(path.join( this.resourceDirectory, url));

    res.writeHead(200, {
      'Content-Type': this.mimeFinder.getMimeType(extension),
      'Content-Length': stat.size
    });
    const readStream = fs.createReadStream(path.join( this.resourceDirectory, url));
    readStream.pipe(res);
  }
}
