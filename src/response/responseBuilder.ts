import { Context } from 'vm';

const success = (body: any) => buildResponse(200, body);
const badRequest = (body: any) => buildResponse(400, body);
const internalError = (body: any) => buildResponse(500, body);

const buildResponse = (statusCode: number, body: any) => ({
    statusCode: statusCode,
    headers: {
        'Access-Control-Allow-Origin': true,
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
});

/****
 * Taken from: https://www.albertgao.xyz/2019/07/08/handle-aws-lambda-error-with-api-gateway-integration-using-typescript-in-a-clean-way/
 *
 * handleError is a function, which takes a function, and returns a function, which makes itself a higher-order function.
 * It takes a function handler which will accept event, context like usual, and returns a function which matches the normal handler signature (3 params).
 * In the body of the returned function, we try catch everything.
 * Any error being thrown inside the handler function, will be re-throw, and since we already unified the error response, we just re-throw without any wrapper.
 * If no errors, we return success
 * */
export const handleError = (handler: (event: any, context: Context) => Promise<any> | any) => {
    return async (
        event: any,
        context: Context
    ) => {
        try {
            const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
            if (allowedMethods.includes(event.httpMethod)) {
                const result = await handler(event, context);
                // instead of returning the callback(...), we just return the object, as per:
                // https://github.com/netlify/netlify-faunadb-example/issues/12
                return success(result);
            } else {
                throw new Error(`Unsupported HTTP Method: ${event.httpMethod}`);
            }
        } catch (err) {
            console.log(err);
            return badRequest(err);
        }
    };
};