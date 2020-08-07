import '../config';
import { handleError } from '../response/responseBuilder';
import { Collection } from '../constants/collections';
import { hasJsonStructure } from '../utility/functionCallUtils';

const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
});

/* export our lambda function as named "handler" export */
export const handler = handleError((event, context) => {
    console.log('Function `muscles` invoked', event.body);
    switch (event.httpMethod) {
        case 'GET':
            return getData(event.body);
        case 'POST':
            return createData(event.body);
        case 'PUT':
            return updateData(event.body);
        case 'DELETE':
            return deleteData(event.body);
        default:
            console.log(`Unsupported HTTP Method: ${event.httpMethod}`);
            break;
    }
});

function createData(data) {
    console.log('POST data');
    const parsedData = JSON.parse(data);
    const muscle = {
        data: {
            name: parsedData.name
        }
    };
    return client.query(
        q.Create(
            q.Ref(q.Collection(Collection.MUSCLES), parsedData.id),
            muscle
        )
    );
}

function getData(data) {
    console.log('GET Data', data);
    if (!hasJsonStructure(data)) {
        return getAllData();
    } else {
        const parsedData = JSON.parse(data);
        return client.query(
            q.Get(
                q.Match(
                    q.Index(`all_${Collection.MUSCLES}`),
                    parsedData.name
                )
            )
        )
            .then((ret) => ret)
            .catch((e) => e);
    }
}

function getAllData() {
    return client.query(q.Paginate(q.Match(q.Index(`literally_all_${Collection.MUSCLES}`))))
        .then((response) => {
            const allMuscles = response.data;
            const getAllTodoDataQuery = allMuscles.map((ref) => {
                return q.Get(ref);
            });
            // then query the refs
            return client.query(getAllTodoDataQuery).then((ret) => ret);
        }).catch((error) => error);
}

function updateData(data) {
    console.log('PUT data');
    const parsedData = JSON.parse(data);
    const muscle = {
        data: {
            name: parsedData.name
        }
    };
    return client.query(
        q.Update(
            q.Ref(q.Collection(Collection.MUSCLES), parsedData.id),
            muscle,
        )
    )
        .then((ret) => ret)
        .catch((e) => e);
}

function deleteData(data) {
    console.log('DELETE data');
    const parsedData = JSON.parse(data);
    return client.query(
        q.Delete(
            q.Ref(q.Collection(Collection.MUSCLES), parsedData.id)
        )
    )
        .then((ret) => ret)
        .catch((e) => e);
}