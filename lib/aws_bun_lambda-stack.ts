import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

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
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess")
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
  }
}
