#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ChatStack } from '../lib/chat';

const app = new cdk.App();
new ChatStack(app, 'ChatStack');
