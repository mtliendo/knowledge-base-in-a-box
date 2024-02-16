import { Context, HTTPRequest } from '@aws-appsync/utils'
import {
	StartIngestionJobInput,
	StartIngestionJobMutationVariables,
} from '../codegen/API'

//* https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_StartIngestionJob.html
export function request(ctx: Context<StartIngestionJobMutationVariables>) {
	const idempotencyKey = util.autoId()
	return {
		method: 'PUT',
		resourcePath: `/knowledgebases/${ctx.args.input.knowledgeBaseId}/datasources/${ctx.args.input.dataSourceId}/ingestionjobs`,
		params: {
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				clientToken: idempotencyKey,
			},
		},
	}
}

export function response(ctx: Context) {
	console.log('response from ingestion', ctx.result)
	return ctx.result.body
}
