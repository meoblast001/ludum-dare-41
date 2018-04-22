import { Promise } from 'es6-promise';
import * as Registry from '../include/UserCommandRegistry';

class HelloWorldCommand implements Registry.CommandInterface {
  public exec(scene: Registry.Scene, selfActor: Registry.Actor): Promise<void> {
    alert("Hello world!");
    return Promise.resolve();
  }
}

Registry.UserCommandRegistry.getSingleton()
  .register('hello_world', new HelloWorldCommand());
