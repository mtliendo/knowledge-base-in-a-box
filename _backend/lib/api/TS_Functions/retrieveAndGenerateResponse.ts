import { Context, HTTPRequest } from '@aws-appsync/utils'
import { RetrieveAndGenerateResponseMutationVariables } from '../codegen/API'

//* https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_RetrieveAndGenerate.html
export function request(
	ctx: Context<RetrieveAndGenerateResponseMutationVariables>
) {
	return {
		method: 'POST',
		resourcePath: `/retrieveAndGenerate`,
		params: {
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				input: {
					text: ctx.args.input.text,
				},
				retrieveAndGenerateConfiguration: {
					knowledgeBaseConfiguration: {
						knowledgeBaseId: ctx.args.input.knowledgeBaseId,
						modelArn: ctx.env.FOUNDATION_MODEL_ARN,
					},
					type: 'KNOWLEDGE_BASE',
				},
				//todo:  sessionId: ''
			},
		},
	}
}

export function response(ctx: Context) {
	console.log('response from retrieval', ctx.result)
	return ctx.result.body
}

// kbid: 3CULQSHHKP
// dsid: 6ELWKW78L2
// jobid: Y4UITXWPYN
