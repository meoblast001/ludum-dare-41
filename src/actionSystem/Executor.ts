import { SequenceCatalog, SequenceAction } from './SequenceData';

export interface ExecutionWorld {
  getExecutionActors(): ExecutionActor[];
}

export interface ExecutionActor {
  readonly name: string;
  move(x: number, y: number): void;
  changeDefaultSequence(sequence: string): void;
}

type ExecutionActorLookup = { [name: string]: ExecutionActor };

export class Executor {
  private static singleton: Executor;

  private worldActorLookup: ExecutionActorLookup = {};

  protected constructor(private sequenceData: SequenceCatalog) {
  }

  public static initialise(sequenceData: SequenceCatalog) {
    Executor.singleton = new Executor(sequenceData);
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
      return new ExecutionSequence(this.sequenceData[sequence], actor,
        this.worldActorLookup);
    } else {
      console.error(`Could not find sequence named "${sequence}".`)
      return null;
    }
  }
}

export class ExecutionSequence {
  private actionIdx: number = 0;

  public constructor(
    private actions: SequenceAction[],
    private actor: ExecutionActor,
    private allActors: ExecutionActorLookup
  ) {
  }

  public executeNext(): boolean {
    if (this.actions.length > this.actionIdx) {
      this.execute(this.actions[this.actionIdx]);
      return true;
    }
    return false;
  }

  protected execute(action: SequenceAction) {
    if (SequenceAction.isASay(action)) {
      // TODO: Activate the text prompt with a say message.
    } else if (SequenceAction.isAPrompt(action)) {
      // TODO: Activate the text prompt with a prompt message.
    } else if (SequenceAction.isAMove(action)) {
      this.actor.move(action.destination[0], action.destination[1]);
    } else if (SequenceAction.isAExec(action)) {
      // TODO: Execute special command.
    } else if (SequenceAction.isAChangeDefaultSequence(action)) {
      if (action.actor in this.allActors) {
        this.allActors[action.actor].changeDefaultSequence(action.seq);
      } else {
        console.error(`Actor "${action.actor}" could not be found.`);
      }
    }
  }
}
