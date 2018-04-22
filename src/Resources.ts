import * as ex from 'excalibur';
import { Resources as ResourcesConfig } from './Configuration';

export class Resources {
  private static singleton: Resources;

  private _textures: { [file: string]: ex.Texture } = {};
  private _tilemaps: { [file: string]: ex.Texture } = {};
  private _sprites: { [file: string]: ex.Texture } = {};

  public constructor(config: ResourcesConfig) {
    for (let file of config.textures) {
      this._textures[file] = new ex.Texture(`assets/textures/${file}`);
    }
    for (let file of config.tilemaps) {
      this._tilemaps[file] = new ex.Texture(`assets/tilesets/${file}`);
    }
    for (let file of config.sprites) {
      this._sprites[file] = new ex.Texture(`assets/sprites/${file}`);
    }
  }

  public static initialise(config: ResourcesConfig) {
    Resources.singleton = new Resources(config);
  }

  public static getSingleton(): Resources {
    return Resources.singleton;
  }

  public get textures(): ex.Texture[] {
    return Object.keys(this._textures).map(key => this._textures[key]);
  }

  public get tilemaps(): ex.Texture[] {
    return Object.keys(this._tilemaps).map(key => this._tilemaps[key]);
  }

  public get sprites(): ex.Texture[] {
    return Object.keys(this._sprites).map(key => this._sprites[key]);
  }

  public getTexture(file: string): ex.Texture | null {
    if (file in this._textures) {
      return this._textures[file];
    }
    return null;
  }

  public getTilemap(file: string): ex.Texture | null {
    if (file in this._tilemaps) {
      return this._tilemaps[file];
    }
    return null;
  }

  public getSprite(file: string): ex.Texture | null {
    if (file in this._sprites) {
      return this._sprites[file];
    }
    return null;
  }
}
