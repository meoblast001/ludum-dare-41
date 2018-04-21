import * as ex from 'excalibur';
import { Promise } from 'es6-promise';
import { SequenceCatalog, SequenceAction } from './SequenceData';
import {TextWindow} from '../TextWindow';

export interface ExecutionWorld {
  getExecutionActors(): ExecutionActor[];
  add(actor: ex.Actor): void;
  remove(actor: ex.Actor): void;
}

export interface ExecutionActor {
  readonly name: string;
  move(target: [number, number]): void;
  changeDefaultSequence(sequence: string): void;
}

export class Executor {
  private static singleton: Executor;

  private world?: ExecutionWorld;

  protected constructor(
    private sequenceData: SequenceCatalog,
    private engine: ex.Engine
  ) {
  }

  public static initialise(engine: ex.Engine, sequenceData: SequenceCatalog) {
    Executor.singleton = new Executor(sequenceData, engine);
  }

  public static getSingleton(): Executor {
    return Executor.singleton;
  }

  public changeWorld(world: ExecutionWorld) {
    this.world = world;
  }

  public beginAction(actor: ExecutionActor, sequence: string)
    : ExecutionSequence | null
  {
    if (sequence in this.sequenceData) {
      if (this.world) {
        return new ExecutionSequence(this.engine, this.sequenceData[sequence],
          actor, this.world);
      } else {
        console.error("There is no world. Initialise executor.");
        return null;
      }
    } else {
      console.error(`Could not find sequence named "${sequence}".`)
      return null;
    }
  }
}

type ExecutionActorLookup = { [name: string]: ExecutionActor };

export class ExecutionSequence {
  private actionIdx: number = 0;
  private worldActorLookup: ExecutionActorLookup = {};

  public constructor(
    private engine: ex.Engine,
    private actions: SequenceAction[],
    private actor: ExecutionActor,
    private world: ExecutionWorld
  ) {
    for (let actor of world.getExecutionActors()) {
      this.worldActorLookup[actor.name] = actor;
    }
  }

  public run() {
    // Execute each next action after another until all actions are completed.
    let execute = () => {
      this.executeNext().then(cont => {
          if (cont) {
            execute();
          }
        })
        .catch((error) => {
          console.error(`In promise: ${error}`);
        });
    }
    execute();
  }

  protected executeNext(): Promise<boolean> {
    if (this.actions.length > this.actionIdx) {
      return this.execute(this.actions[this.actionIdx++])
        .then(() => true);
    }
    return Promise.resolve(false);
  }

  protected execute(action: SequenceAction): Promise<void> {
    if (SequenceAction.isASay(action)) {
      return new Promise((resolve, reject) => {
        let window = new TextWindow(this.engine, () => {
            this.world.remove(window);
            resolve();
          },
          action.text, undefined,
          action.color ? ex.Color.fromHex(action.color) : undefined);
        this.world.add(window);
      });
    } else if (SequenceAction.isAPrompt(action)) {
      // TODO: Activate the text prompt with a prompt message.
    } else if (SequenceAction.isAMove(action)) {
      this.actor.move([action.destination[0], action.destination[1]]);
      return Promise.resolve();
    } else if (SequenceAction.isADelay(action)) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, action.millis);
      });
    } else if (SequenceAction.isAExec(action)) {
      // TODO: Execute special command.
      return Promise.resolve();
    } else if (SequenceAction.isAChangeDefaultSequence(action)) {
      if (action.actor in this.worldActorLookup) {
        this.worldActorLookup[action.actor].changeDefaultSequence(action.seq);
        return Promise.resolve();
      } else {
        return Promise.reject(`Actor "${action.actor}" could not be found.`)
      }
    }
    return Promise.reject(`Unknown action ${action.action}.`);
  }
}
