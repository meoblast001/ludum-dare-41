import * as ex from 'excalibur';
import {TextWindow} from './TextWindow';
import { RID, TextureResources } from './Resources';

export default class GameplayScene extends ex.Scene {
  public static readonly Name = "GameplayScene";

  public onInitialize(engine: ex.Engine) {
    this.camera = new ex.BaseCamera();

    // Create actor.
    let cross = new ex.Actor();
    cross.addDrawing(TextureResources[RID.TextureCross]);
    let str = "lorem ipsum dolor sit amet conquestadur est noone expects the spanish inqisition as in the beginning there was a red robe";
    let win = new TextWindow(engine, str, ex.Color.White);
    this.add(cross);
    this.add(win);
  }

  public onActivate() { }

  public onDeactivate() { }
}
