import * as ex from 'excalibur';
import { RID, TextureResources } from './Resources';

export default class GameplayScene extends ex.Scene {
  public static readonly Name = "GameplayScene";

  public onInitialize(engine: ex.Engine) {
    this.camera = new ex.BaseCamera();

    // Create actor.
    let cross = new ex.Actor();
    cross.addDrawing(TextureResources[RID.TextureCross]);
    this.add(cross);
  }

  public onActivate() { }

  public onDeactivate() { }
}
