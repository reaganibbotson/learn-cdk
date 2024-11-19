import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ComputeStack } from './compute-stack';
import { AuthStack } from './auth-stack';
import path = require('path');

export class APIStack extends cdk.Stack {
    constructor(
        scope: Construct, 
        id: string, 
        computeStack: ComputeStack, 
        authStack: AuthStack, 
        props?: cdk.StackProps
    ) {
        super(scope, id, props);

        const api = new apigateway.RestApi(this, 'api', {
            restApiName: 'LearnCdkApi',
        })

        // Create API Keys and Usage Plans
        const apiKey1 = new apigateway.ApiKey(this, 'goldApiKey');
        const usagePlan1 = new apigateway.UsagePlan(this, 'goldUsagePlan', {
            apiStages: [{ api: api, stage: api.deploymentStage }],
            quota: { limit: 1000, period: apigateway.Period.DAY },
            throttle: { burstLimit: 20, rateLimit: 10 },
        });
        usagePlan1.addApiKey(apiKey1);

        const apiKey2 = new apigateway.ApiKey(this, 'silverApiKey');
        const usagePlan2 = new apigateway.UsagePlan(this, 'silverUsagePlan', {
            apiStages: [{ api: api, stage: api.deploymentStage }],
            quota: { limit: 5, period: apigateway.Period.DAY },
            throttle: { burstLimit: 5, rateLimit: 1 },
        });
        usagePlan2.addApiKey(apiKey2);
        
        // Create user pool authorizer
        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [authStack.userPool],
        });
        const authorizerParams = {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        }
        
        // API Routes:
        const rootApiResource = api.root.addResource('api').addResource('v1');
        // Auth routes
        const authResource = rootApiResource.addResource('auth');
        const loginRoute = authResource.addResource('login');
        const registerRoute = authResource.addResource('register');
        const register2Route = authResource.addResource('register2');
        const logoutRoute = authResource.addResource('logout');

        loginRoute.addMethod('POST', new apigateway.LambdaIntegration(computeStack.loginLambda));
        registerRoute.addMethod('POST', new apigateway.LambdaIntegration(computeStack.registerLambda));
        register2Route.addMethod('POST', new apigateway.LambdaIntegration(computeStack.register2Lambda));
        logoutRoute.addMethod('POST', new apigateway.LambdaIntegration(computeStack.logoutLambda));

        const protectedResource = api.root.addResource('protected');
        protectedResource.addMethod('GET', new apigateway.MockIntegration(), authorizerParams);

        new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });

    }
}
