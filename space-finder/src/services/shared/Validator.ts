import { SpaceEntry } from '../model/Model';

export class MissingField extends Error {
  constructor(missingField: string) {
    super(`Value for "${missingField}" field expected!`);
  }
}

export class JSONError extends Error {
  constructor(message: string) {
    super(`JSON Error: ${message}`);
  }
}

export function validateAsSpaceEntry(args: SpaceEntry) {
  if (args.id === undefined) {
    throw new MissingField('id');
  }
  if (args.location === undefined) {
    throw new MissingField('location');
  }
  if (args.name === undefined) {
    throw new MissingField('name');
  }
}
