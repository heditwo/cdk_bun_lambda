#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsBunLambdaStack } from "../lib/aws_bun_lambda-stack";

const app = new cdk.App();

export const deployment_env = app.node.tryGetContext("deployment_env");

new AwsBunLambdaStack(app, `AwsBunLambdaStack-${deployment_env}`, {});
