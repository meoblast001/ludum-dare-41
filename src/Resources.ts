import * as ex from 'excalibur';

export enum RID {
  TextureCross,
}

const Resources: { [id: string]: ex.ILoadable } = { };
Resources[RID.TextureCross] = new ex.Texture("assets/textures/cross.png");

export default Resources;
