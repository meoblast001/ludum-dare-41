export interface Configuration {
  startSeq: string;
  gridUnitSize: number;
  worldSize: [number, number],
  resources: Resources;
  player: Player;
  actors: Actor[];
  map: MapDefintion;
}

export interface Resources {
  textures: string[];
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
  cells: MapCellDefinition[];
  tileSheets: MapTileSheet[];
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
}

export interface MapCellDefinition {
  x: number;
  y: number;
  tileId: number;
  sheetId: number;
}

export interface MapTileSheet {
  id: number;
  path: string;
  cols: number;
  rows: number;
}
