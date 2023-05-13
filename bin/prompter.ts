#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PrompterStack } from '../lib/prompter-stack';

const app = new cdk.App();
new PrompterStack(app, 'PrompterStack');
