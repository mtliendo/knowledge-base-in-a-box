import { Context, HTTPRequest } from '@aws-appsync/utils'

//* https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_CreateDataSource.html
export function request(ctx: Context) {
	console.log('the incoming request', JSON.parse(ctx.prev.result))
	const resObj = JSON.parse(ctx.prev.result)

	const idempotencyKey = util.autoId()
	return {
		method: 'PUT',
		resourcePath: `/knowledgebases/${resObj.knowledgeBase.knowledgeBaseId}/datasources`,
		params: {
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				name: ctx.args.name,
				clientToken: idempotencyKey,
				dataSourceConfiguration: {
					type: 'S3',
					s3Configuration: {
						bucketArn: ctx.env.BUCKET_ARN,
						inclusionPrefixes: ['protected/'],
					},
				},
				vectorIngestionConfiguration: {
					chunkingConfiguration: {
						chunkingStrategy: 'FIXED_SIZE',
						fixedSizeChunkingConfiguration: {
							maxTokens: 300,
							overlapPercentage: 20,
						},
					},
				},
			},
		},
	}
}

export function response(ctx: Context) {
	console.log('response from datasource', ctx.result)
	return ctx.result.body
}
