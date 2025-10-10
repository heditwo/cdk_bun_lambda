import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as api from "aws-cdk-lib/aws-apigatewayv2";
import { deployment_env } from "../bin/aws_bun_lambda";
import { ApiEndpointLambda } from "./constructs/ApiEndpointLambda";

export class AwsBunLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // ################################################################################################################################################################
    //                                                          POLICIES AND ROLES
    // ################################################################################################################################################################

    const LambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    LambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess")
    );

    const ApiRole = new iam.Role(this, `ApiRole`, {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal("apigateway.amazonaws.com"),
        new iam.AccountRootPrincipal()
      ),
    });

    ApiRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: ["*"],
      })
    );

    // ################################################################################################################################################################
    //                                                             LAMBDA LAYERS
    // ################################################################################################################################################################

    // bun runtime layer
    const BunLayer = new lambda.LayerVersion(this, "BunLambdaLayer", {
      code: lambda.Code.fromAsset("layers/bun-lambda-layer.zip"),
      compatibleRuntimes: [lambda.Runtime.PROVIDED_AL2],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      description: "Bun runtime layer for Lambda",
    });

    // shared dependencies layer
    const DependencyLayer = new lambda.LayerVersion(this, "dependencies", {
      code: lambda.Code.fromAsset("./src/dependencies"),
      compatibleRuntimes: [lambda.Runtime.PROVIDED_AL2],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ################################################################################################################################################################
    //                                                             API GATEWAY
    // ################################################################################################################################################################

    const NotFound = new lambda.Function(this, "NotFound", {
      code: lambda.Code.fromAsset("./src/handlers/api/404"),
      handler: "index.handler",
      runtime: lambda.Runtime.PROVIDED_AL2,
      role: LambdaRole,
      timeout: cdk.Duration.seconds(30),
      retryAttempts: 0,
      memorySize: deployment_env === "prod" ? 1024 : 1024,
    });

    const Api = new api.CfnApi(this, `Api`, {
      name: `atlantis-backend-api-${deployment_env}`,
      protocolType: "HTTP",
      description: `Microservice API for ATLANTIS system`,
      credentialsArn: ApiRole.roleArn,
      corsConfiguration: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["content-type"],
      },
      target: NotFound.functionArn,
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: `https://${Api.attrApiId}.execute-api.${this.region}.amazonaws.com`,
      description: "API Gateway URL",
    });

    // ################################################################################################################################################################
    //                                                                 LAMBDAS
    // ################################################################################################################################################################

    const bunFunction = new lambda.Function(this, "BunFunction", {
      runtime: lambda.Runtime.PROVIDED_AL2,
      code: lambda.Code.fromAsset("src/handlers/HelloWorld"),
      handler: "index.handler",
      role: LambdaRole,
      layers: [BunLayer, DependencyLayer],
      architecture: lambda.Architecture.ARM_64,
    });

    const ApiLoggerEndpoint = new ApiEndpointLambda(this, "ApiLogger", {
      api: Api,
      route: "ANY /api/log",
      region: this.region,
      handlerFunctionProps: {
        runtime: lambda.Runtime.PROVIDED_AL2,
        code: lambda.Code.fromAsset("src/handlers/api/ApiLogger"),
        handler: "index.handler",
        role: LambdaRole,
        layers: [BunLayer],
        architecture: lambda.Architecture.ARM_64,
      },
    });
  }
}
