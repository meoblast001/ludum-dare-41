export interface Configuration {
  startSeq: string;
  gridUnitSize: number;
  worldSize: [number, number],
  resources: Resources;
  spriteDefinitions: [SpriteDefinition];
  player: Player;
  actors: Actor[];
  map: MapDefintion;
}

export interface Resources {
  textures: string[];
  tilemaps: string[];
  sprites: string[];
}

export interface SpriteDefinition {
  name: string;
  texture: string;
  frameSize: [number, number];
  cols: number;
  rows: number;
  defaultStatic: string;
  statics: StaticDefinition[];
  animations: AnimationDefinition[];
}

export interface StaticDefinition {
  name: string;
  frameIndex: number;
}

export interface AnimationDefinition {
  name: string;
  frameIndices: number[];
  speed: number;
}

export interface Player extends Positioned, Textureable, Spriteable {
}

export interface Actor extends Positioned, Textureable, Spriteable {
  name: string;
  defaultSeq: string;
}

export interface Positioned {
  position: [number, number];
}

export interface Textureable {
  texture?: string;
}

export interface Spriteable {
  sprite?: string;
}

export interface MapDefintion {
  instance: MapInstanceDefinition;
  tileSheets: MapTileSheet[];
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
}

export interface MapInstanceDefinition {
  sheetId: number;
  cols: MapColDefinition[];
}

export interface MapColDefinition {
  cells: MapCellDefinition[];
}

export interface MapCellDefinition {
  tileId: number;
  repeat?: number;
}

export interface MapTileSheet {
  id: number;
  path: string;
  cols: number;
  rows: number;
}
