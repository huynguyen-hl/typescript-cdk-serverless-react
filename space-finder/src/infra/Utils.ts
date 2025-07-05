import { Fn, Stack } from 'aws-cdk-lib';

function getSuffixFromStack(stack: Stack): string {
  const shortStackId = Fn.select(2, Fn.split('/', stack.stackId));
  const suffix = Fn.select(4, Fn.split('-', shortStackId));
  return suffix;
}

export { getSuffixFromStack };