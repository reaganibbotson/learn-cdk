import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AuthStack } from './auth-stack';
const path = require('path');

export class ComputeStack extends cdk.Stack {
    public readonly registerLambda: lambda.Function;
    public readonly register2Lambda: lambda.Function;
    public readonly loginLambda: lambda.Function;
    public readonly logoutLambda: lambda.Function;

    constructor(scope: Construct, id: string, authStack: AuthStack, props?: cdk.StackProps) {
        super(scope, id, props);

        const lambdaBasePath = path.join(__dirname, '../lambda');

        const authEnv = {
            USER_POOL_ID: authStack.userPool.userPoolId,
            USER_POOL_CLIENT_ID: authStack.userPoolClient.userPoolClientId,
        }

        this.registerLambda = new lambda.Function(this, 'RegisterFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'register.handler',
            code: lambda.Code.fromAsset(path.join(lambdaBasePath, 'auth')),
            environment: authEnv,
        });

        this.register2Lambda = new NodejsFunction(this, 'Register2Function', {
            entry: path.join(__dirname, '../lambda/auth/register.ts'),
            handler: 'handler',
            environment: {
                USER_POOL_ID: authStack.userPool.userPoolId,
                USER_POOL_CLIENT_ID: authStack.userPoolClient.userPoolClientId,
            },
        });

        this.loginLambda = new lambda.Function(this, 'LoginFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'login.handler',
            code: lambda.Code.fromAsset(path.join(lambdaBasePath, 'auth')),
            environment: authEnv,
        });

        this.logoutLambda = new lambda.Function(this, 'LogoutFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'logout.handler',
            code: lambda.Code.fromAsset(path.join(lambdaBasePath, 'auth')),
            environment: authEnv,
        });


  }
}