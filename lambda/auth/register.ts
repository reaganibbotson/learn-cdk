import { APIGatewayProxyEvent } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event: APIGatewayProxyEvent) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'No request body provided' }),
        };
    }
    
    const body = JSON.parse(event.body);
    const { email, password, familyName, patronID } = body;

    try {
        await cognito.signUp({
                ClientId: process.env.USER_POOL_CLIENT_ID as string,
                Username: email,
                Password: password,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'family_name', Value: familyName },
                    { Name: 'custom:patronID', Value: patronID },
                ],
            })
            .promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User registered successfully' }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to register user', err }),
        };
    }
};