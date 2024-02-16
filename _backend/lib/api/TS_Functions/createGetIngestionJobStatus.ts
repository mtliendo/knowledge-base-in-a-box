import { Context, HTTPRequest } from '@aws-appsync/utils'
import { GetIngestionJobStatusQueryVariables } from '../codegen/API'

//* https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_StartIngestionJob.html
export function request(ctx: Context<GetIngestionJobStatusQueryVariables>) {
	const idempotencyKey = util.autoId()
	return {
		method: 'GET',
		resourcePath: `/knowledgebases/${ctx.args.input.knowledgeBaseId}/datasources/${ctx.args.input.dataSourceId}/ingestionjobs/${ctx.args.input.ingestionJobId}`,
		params: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	} as HTTPRequest
}

export function response(ctx: Context) {
	console.log('response from ingestion', ctx.result)
	return ctx.result.body
}

// kbid: 3CULQSHHKP
// dsid: 6ELWKW78L2
// jobid: Y4UITXWPYN
