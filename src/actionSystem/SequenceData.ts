export type SequenceCatalog = { [name: string]: SequenceAction[] };

export namespace SequenceAction {
  function isASay(subject: SequenceAction): subject is Say {
    return subject.action == 'say';
  }

  function isAPrompt(subject: SequenceAction): subject is Prompt {
    return subject.action == 'prompt';
  }

  function isAMove(subject: SequenceAction): subject is Move {
    return subject.action == 'move';
  }

  function isAExec(subject: SequenceAction): subject is Exec {
    return subject.action == 'exec';
  }

  function isAChangeDefaultSequence(subject: SequenceAction): subject is ChangeDefaultSequence {
    return subject.action == 'change_def_seq';
  }
}

export interface SequenceAction {
  action: string;
}

export interface Say extends SequenceAction {
  text: string;
}

export interface Prompt extends Say {
  options: string[];
}

export interface Move extends SequenceAction {
  destination: [number, number];
}

export interface Exec extends SequenceAction {
  event: string;
}

export interface ChangeDefaultSequence extends SequenceAction {
  actor: string;
  seq: string;
}
