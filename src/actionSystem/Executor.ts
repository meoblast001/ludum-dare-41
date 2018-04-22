import * as ex from 'excalibur';
import { Promise } from 'es6-promise';
import { SequenceCatalog, SequenceAction } from './SequenceData';
import {TextWindow} from '../TextWindow';
import { UserCommandRegistry } from '../../include/UserCommandRegistry';

export interface ExecutionWorld {
  getExecutionActors(): ExecutionActor[];
  add(actor: ex.Actor): void;
  remove(actor: ex.Actor): void;
}

export interface ExecutionActor {
  readonly name: string;
  move(target: [number, number]): Promise<void> | null;
  changeDefaultSequence(sequence: string): void;
}

export class Executor {
  private static singleton: Executor;

  private world?: ExecutionWorld;
  public isBlocked: boolean = false;

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
        return new ExecutionSequence(this, this.engine,
          this.sequenceData[sequence], actor, this.world);
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

class ExecuteNextResult {
  public constructor (
    public cont: boolean,
    public nextSeq: string | null
  ) {
  }
}

export class ExecutionSequence {
  private actionIdx: number = 0;
  private worldActorLookup: ExecutionActorLookup = {};

  public constructor(
    private executor: Executor,
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
    // Records the next sequence to run if there is one.
    let nextSeq: string | null = null;

    // Execute each next action after another until all actions are completed.
    let execute = () => {
      this.executeNext().then(result => {
          // If result contains a sequence, store it as the next sequence.
          if (result.nextSeq) {
            nextSeq = result.nextSeq;
          }

          if (result.cont) {
            execute();
          } else if (nextSeq) {
            // Sequence over and a new sequence will be executed.
            let next = this.executor.beginAction(this.actor, nextSeq);
            if (next) {
              next.run();
            } else {
              console.error(`Next sequence "${nextSeq}" could not be found.`);
            }
          }
        })
        .catch((error) => {
          console.error(`In promise: ${error}`);
        });
    }
    execute();
  }

  protected executeNext(): Promise<ExecuteNextResult> {
    if (this.actions.length > this.actionIdx) {
      return this.execute(this.actions[this.actionIdx++])
        .then(nextSeq => new ExecuteNextResult(true, nextSeq));
    }
    return Promise.resolve(new ExecuteNextResult(false, null));
  }

  protected execute(action: SequenceAction): Promise<string | null> {
    if (SequenceAction.isASay(action)) {
      return new Promise((resolve, reject) => {
        this.executor.isBlocked = true;
        let window = new TextWindow(this.engine, () => {
            this.world.remove(window);
            this.executor.isBlocked = false
            resolve();
          },
          action.text, undefined,
          action.color ? ex.Color.fromHex(action.color) : undefined);
        this.world.add(window);
      });
    } else if (SequenceAction.isAPrompt(action)) {
      return new Promise((resolve, reject) => {
        this.executor.isBlocked = true;
        let window = new TextWindow(this.engine, (selectedIdx?: number) => {
            this.world.remove(window);
            this.executor.isBlocked = false;
            if (selectedIdx !== undefined
                && selectedIdx < action.options.length
            ) {
              resolve(action.options[selectedIdx].nextSeq);
            } else {
              console.error("Incorrectly selected option.")
              resolve(null);
            }
          },
          // TODO: Respond to options.
          action.text,
          action.options.map(option => option.text),
          action.color ? ex.Color.fromHex(action.color) : undefined);
        this.world.add(window);
      });
    } else if (SequenceAction.isAMove(action)) {
      this.actor.move([action.destination[0], action.destination[1]]);
      return Promise.resolve(null);
    } else if (SequenceAction.isADelay(action)) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, action.millis);
      });
    } else if (SequenceAction.isAExec(action)) {
      let command = UserCommandRegistry.getSingleton()
        .getCommandByName(action.command);
      if (command) {
        return command.exec(this.world as any, this.actor as any)
          .then(() => null);
      } else {
        return Promise.reject(`Command "${action.command}" unknown.`);
      }
    } else if (SequenceAction.isAChangeDefaultSequence(action)) {
      if (action.actor in this.worldActorLookup) {
        this.worldActorLookup[action.actor].changeDefaultSequence(action.seq);
        return Promise.resolve(null);
      } else {
        return Promise.reject(`Actor "${action.actor}" could not be found.`)
      }
    }
    return Promise.reject(`Unknown action "${action.action}".`);
  }
}
