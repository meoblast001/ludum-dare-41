import * as ex from 'excalibur';
import { Promise } from 'es6-promise';
import { SequenceCatalog, SequenceAction } from './SequenceData';
import {TextWindow} from '../TextWindow';

export interface ExecutionWorld {
  getExecutionActors(): ExecutionActor[];
}

export interface ExecutionActor {
  readonly name: string;
  move(target: [number, number]): void;
  changeDefaultSequence(sequence: string): void;
}

type ExecutionActorLookup = { [name: string]: ExecutionActor };

export class Executor {
  private static singleton: Executor;

  private worldActorLookup: ExecutionActorLookup = {};

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
    this.worldActorLookup = {};
    for (let actor of world.getExecutionActors()) {
      this.worldActorLookup[actor.name] = actor;
    }
  }

  public beginAction(actor: ExecutionActor, sequence: string)
    : ExecutionSequence | null
  {
    if (sequence in this.sequenceData) {
      return new ExecutionSequence(this.engine, this.sequenceData[sequence],
        actor, this.worldActorLookup);
    } else {
      console.error(`Could not find sequence named "${sequence}".`)
      return null;
    }
  }
}

export class ExecutionSequence {
  private actionIdx: number = 0;

  public constructor(
    private engine: ex.Engine,
    private actions: SequenceAction[],
    private actor: ExecutionActor,
    private allActors: ExecutionActorLookup
  ) {
  }

  public run() {
  }

  protected executeNext(): Promise<boolean> {
    if (this.actions.length > this.actionIdx) {
      this.execute(this.actions[this.actionIdx])
        .then(() => Promise.resolve(true))
    }
    return Promise.resolve(false);
  }

  protected execute(action: SequenceAction): Promise<void> {
    if (SequenceAction.isASay(action)) {
      return new Promise((resolve, reject) => {
        let window = new TextWindow(this.engine, () => resolve(), action.text,
          action.color ? ex.Color.fromHex(action.color) : undefined);
      })
    } else if (SequenceAction.isAPrompt(action)) {
      // TODO: Activate the text prompt with a prompt message.
    } else if (SequenceAction.isAMove(action)) {
      this.actor.move([action.destination[0], action.destination[1]]);
      return Promise.resolve();
    } else if (SequenceAction.isAExec(action)) {
      // TODO: Execute special command.
      return Promise.resolve();
    } else if (SequenceAction.isAChangeDefaultSequence(action)) {
      if (action.actor in this.allActors) {
        this.allActors[action.actor].changeDefaultSequence(action.seq);
        return Promise.resolve();
      } else {
        return Promise.reject(`Actor "${action.actor}" could not be found.`)
      }
    }
    return Promise.reject(`Unknown action ${action.action}.`);
  }
}
