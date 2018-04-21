export type SequenceCatalog = { [name: string]: SequenceAction[] };

export namespace SequenceAction {
  export function isASay(subject: SequenceAction): subject is Say {
    return subject.action == 'say';
  }

  export function isAPrompt(subject: SequenceAction): subject is Prompt {
    return subject.action == 'prompt';
  }

  export function isAMove(subject: SequenceAction): subject is Move {
    return subject.action == 'move';
  }

  export function isADelay(subject: SequenceAction): subject is Delay {
    return subject.action == 'delay';
  }

  export function isAExec(subject: SequenceAction): subject is Exec {
    return subject.action == 'exec';
  }

  export function isAChangeDefaultSequence(subject: SequenceAction)
    : subject is ChangeDefaultSequence
  {
    return subject.action == 'change_def_seq';
  }
}

export interface SequenceAction {
  action: string;
}

export interface Say extends SequenceAction {
  text: string;
  color?: string;
}

export interface Prompt extends Say {
  options: string[];
}

export interface Move extends SequenceAction {
  destination: [number, number];
}

export interface Delay extends SequenceAction {
  millis: number;
}

export interface Exec extends SequenceAction {
  event: string;
}

export interface ChangeDefaultSequence extends SequenceAction {
  actor: string;
  seq: string;
}
