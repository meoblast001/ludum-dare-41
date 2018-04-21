export interface Configuration {
  resources: Resources;
  player: Player;
  actors: Actor[];
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
