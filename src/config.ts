import * as dotenv from 'dotenv';

dotenv.config();
let path;
switch (process.env.NODE_ENV) {
    case 'test':
        path = `${__dirname}/../../.env`;
        break;
    case 'production':
        path = `${__dirname}/../../.env`;
        break;
    default:
        path = `${__dirname}/../../.env`;
}
dotenv.config({ path: path });