#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { APIStack } from '../lib/api-stack';
import { ComputeStack } from '../lib/compute-stack';
import { AuthStack } from '../lib/auth-stack';

const app = new cdk.App();
const authStack = new AuthStack(app, 'AuthStack');
const computeStack = new ComputeStack(app, 'ComputeStack', authStack);

new APIStack(
  app, 
  'LearnCdkStack', 
  computeStack,
  authStack
);