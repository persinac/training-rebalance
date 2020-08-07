import '../config';
import { handleError } from '../response/responseBuilder';
import { Collection } from '../constants/collections';
const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
});

/* export our lambda function as named "handler" export */
export const handler = handleError((event, context) => {
    const data = JSON.parse(event.body);
    console.log('Function `todo-create` invoked', data);
    const todoItem = {
        data: data
    };
    /* construct the fauna query */
    return client.query(
            q.Create(
                q.Collection(Collection.TODOS),
                todoItem
            )
        );
});