# Lambda 🤝 Bun

This is a project template for a very minimal lambda environment which runs bun and allows for shared code in the form of a dependency layer.

To deploy this, you'll need to have built the bun layer via `bun run build:bun` in the root directory.

Thank you ❤️ to the [@oven-sh](https://github.com/oven-sh) team for maintaining the lambda runtime layer.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `bun run build` compile typescript to js
- `bun run build:bun` compile the bun lambda layer
- `bun run watch` watch for changes and compile
- `bun run test` perform the jest unit tests
- `bunx cdk deploy` deploy this stack to your default AWS account/region
- `bunx cdk diff` compare deployed stack with current state
- `bunx cdk synth` emits the synthesized CloudFormation template
