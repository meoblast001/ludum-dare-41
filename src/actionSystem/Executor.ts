import { SequenceCatalog, SequenceAction } from './SequenceData';

export interface ExecutionActor {
  readonly name: string;
  move(x: number, y: number): void;
  changeDefaultSequence(sequence: string): void;
}

export class Executor {
  private static singleton: Executor;

  protected constructor(private sequenceData: SequenceCatalog) {
  }

  public static initialise(sequenceData: SequenceCatalog) {
    Executor.singleton = new Executor(sequenceData);
  }

  public static getSingleton(): Executor {
    return Executor.singleton;
  }

  public beginAction(actor: ExecutionActor, sequence: string) {
    return new ExecutionSequence(actor, this.sequenceData[sequence]);
  }
}

export class ExecutionSequence {
  private actionIdx: number = 0;

  public constructor(private actor: ExecutionActor, private actions: SequenceAction[]) {
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
    } else if (SequenceAction.isAChangeDefaultSequence(action))) {
      // TODO: Find actor and change the default sequence.
    }
  }
}
