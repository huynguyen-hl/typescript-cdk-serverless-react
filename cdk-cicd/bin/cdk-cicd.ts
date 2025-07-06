#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkCicdStack } from '../lib/cdk-cicd-stack';
import { LambdaStack } from '../lib/LambdaStack';

const app = new cdk.App();

new CdkCicdStack(app, 'CdkCicdStack');

app.synth();