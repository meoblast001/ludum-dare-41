import { Promise } from 'es6-promise';
import GameplayScene from '../src/GameplayScene';
import { ResponsiveActor } from '../src/ResponsiveActor';

export interface CommandInterface {
  exec(scene: GameplayScene, selfActor: ResponsiveActor): Promise<void>;
}

export class UserCommandRegistry {
  private static singleton: UserCommandRegistry | null;

  private commands: { [name: string]: CommandInterface } = {};

  public static getSingleton(): UserCommandRegistry {
    if (!UserCommandRegistry.singleton) {
      UserCommandRegistry.singleton = new UserCommandRegistry();
    }
    return UserCommandRegistry.singleton;
  }

  public register(name: string, command: CommandInterface) {
    this.commands[name] = command;
  }

  public getCommandByName(name: string): CommandInterface | null {
    if (name in this.commands) {
      return this.commands[name];
    } else {
      return null;
    }
  }
}

export const Scene = GameplayScene;
export type Scene = GameplayScene;
export const Actor = ResponsiveActor;
export type Actor = ResponsiveActor;
