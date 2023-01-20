import { DocumentClient } from 'aws-sdk/clients/dynamodb';
export const client = new DocumentClient();

export const TABLE_NAME = process.env.TABLE_NAME
export const VICTIM_GSI = 'trackingIndex'
export const MAX_WRITE_REQUESTS = 25
export const EMAIL_GSI = 'emailIndex'
