import * as api from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface ApiEndpointLambdaProps {
  api: api.CfnApi;
  authorizer?: api.CfnAuthorizer;
  route: string;
  region: string;
  handlerFunctionProps: lambda.FunctionProps;
}

export class ApiEndpointLambda extends Construct {
  public swaggerDoc: any;
  public route: string;
  public handlerFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ApiEndpointLambdaProps) {
    super(scope, id);

    this.route = props.route;

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

    const handlerLambda = new lambda.Function(
      this,
      `${id}Function`,
      props.handlerFunctionProps
    );

    this.handlerFunction = handlerLambda;

    const integration = new api.CfnIntegration(this, `${id}Integration`, {
      apiId: props.api.attrApiId,
      integrationType: "AWS_PROXY",
      integrationUri: `arn:aws:apigateway:${props.region}:lambda:path/2015-03-31/functions/${this.handlerFunction.functionArn}/invocations`,
      credentialsArn: ApiRole.roleArn,
      payloadFormatVersion: "2.0",
    });

    integration.node.addDependency(handlerLambda);
    integration.node.addDependency(props.api);

    let routeProps = {
      apiId: props.api.attrApiId,
      routeKey: props.route,
      authorizationType: props.authorizer ? "CUSTOM" : "NONE",
      target: `integrations/${integration.ref}`,
    } as any;

    if (props.authorizer)
      routeProps.authorizerId = props.authorizer.attrAuthorizerId;

    const route = new api.CfnRoute(this, `${id}Route`, routeProps);

    if (props.authorizer) route.node.addDependency(props.authorizer);

    route.node.addDependency(props.api);
    route.node.addDependency(integration);
  }
}
