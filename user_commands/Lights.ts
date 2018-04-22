import {Promise} from 'es6-promise';
import * as Registry from '../include/UserCommandRegistry';

class LightsOn implements Registry.CommandInterface {
  public exec(scene: Registry.Scene, selfActor: Registry.Actor): Promise<void> {
    for (let actor of scene.actors) {
      actor.opacity = 1;
    }
    return Promise.resolve();
  }
}

class LightsOff implements Registry.CommandInterface {
  public exec(scene: Registry.Scene, selfActor: Registry.Actor): Promise<void> {
    for (let actor of scene.actors) {
      actor.opacity = 0;
    }
    return Promise.resolve();
  }
}

Registry.UserCommandRegistry.getSingleton()
  .register('lights_off', new LightsOff());

Registry.UserCommandRegistry.getSingleton()
  .register('lights_on', new LightsOn());
