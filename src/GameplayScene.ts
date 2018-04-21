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
    var str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    let win = new TextWindow(engine, str, ex.Color.Blue);
    this.add(cross);
    this.add(win);
  }

  public onActivate() { }

  public onDeactivate() { }
}
