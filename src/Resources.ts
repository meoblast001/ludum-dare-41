import * as ex from 'excalibur';

export enum RID {
  TextureCross,
}

export const TextureResources: { [id: string]: ex.Texture } = { };
TextureResources[RID.TextureCross]
  = new ex.Texture("assets/textures/cross.png");

const Resources: { [id: string]: ex.ILoadable } = { };
for (let resource in TextureResources) {
  Resources[resource] = TextureResources[resource];
}

export default Resources;
