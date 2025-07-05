#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStarterStack } from '../lib/cdk-starter-stack';
import { PhotosStack } from '../lib/PhotosStack';
import { PhotosHandlerStack } from '../lib/PhotosHandlerStack';
import { BucketTagger } from '../lib/BucketTagger';

const app = new cdk.App();

const photosStack = new PhotosStack(app, 'PhotosStack');
new PhotosHandlerStack(app, 'PhotosHandlerStack', {
  targetBucket: photosStack.photosBucketArn,
});

const tagger = new BucketTagger('level', 'test');
cdk.Aspects.of(app).add(tagger);
