/* bootstrap database in your FaunaDB account */
const readline = require('readline');
const faunadb = require('faunadb');
const chalk = require('chalk');
const insideNetlify = insideNetlifyBuildContext();
const q = faunadb.query;

console.log(chalk.cyan('Creating your FaunaDB Database...\n'));

// 1. Check for required environment variables
if (!process.env.FAUNADB_SERVER_SECRET) {
    console.log(chalk.yellow('Required FAUNADB_SECRET enviroment variable not found.'));
    if (insideNetlify) {
        console.log(`Visit https://app.netlify.com/sites/YOUR_SITE_HERE/settings/deploys`);
        console.log('and set a `FAUNADB_SECRET` value in the "Build environment variables" section');
        process.exit(1)
    }
    // Local machine warning
    if (!insideNetlify) {
        console.log();
        console.log('You can create fauna DB keys here: https://dashboard.fauna.com/db/keys');
        console.log();
        ask(chalk.bold('Enter your faunaDB server key'), (err, answer) => {
            if (!answer) {
                console.log('Please supply a faunaDB server key');
                process.exit(1)
            }
            queueAllDBs(answer).then(() => {
                console.log('Database created')
            })
        });
    }
}

// Has var. Do the thing
if (process.env.FAUNADB_SERVER_SECRET) {
    queueAllDBs(process.env.FAUNADB_SERVER_SECRET).then(() => {
        console.log('Database created')
    })
}

/* idempotent operation */
async function queueAllDBs(key) {
    console.log('Create the database(s)!');
    const client = new faunadb.Client({
        secret: key
    });

    const dbsToCreate = [
        {name: "todos", indexTerms: {}},
        {name: "musclegroups", indexTerms: {}},
        {name: "muscles", indexTerms: {
                field: ['data', 'name']
            }}
    ];

    for (const o of dbsToCreate) {
        console.log(`Queue'ing up: ${o.name}`);
        await createFaunaDB(client, o)
    }
    return "Done!";
}

/* idempotent operation */
async function createFaunaDB(client, dbToCreate) {
    console.log(`Creating: ${dbToCreate.name}`);
    await client.query(q.CreateCollection({ name: dbToCreate.name }))
        .then((result)=>{
            console.log(`Created: ${dbToCreate.name}`);
            return client.query(
                q.Create(q.Ref("indexes"), {
                    name: `all_${dbToCreate.name}`,
                    source: q.Collection(`${dbToCreate.name}`),
                    terms: [
                        dbToCreate.indexTerms
                    ]
                }))
        }).catch((e) => {
            // Database already exists
            if (e.requestResult.statusCode === 400 && e.message === 'instance not unique') {
                console.log('DB already exists', dbToCreate);
            } else {
                console.log('Error! ', e);
            }
        });
    return "Done!";
}


/* util methods */

// Test if inside netlify build context
function insideNetlifyBuildContext() {
    return !!process.env.DEPLOY_PRIME_URL;
}

// Readline util
function ask(question, callback) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(question + '\n', function(answer) {
        rl.close();
        callback(null, answer);
    });
}