import { Context, HTTPRequest } from '@aws-appsync/utils'

type kbconfig = {
	type: string
	vectorKnowledgeBaseConfiguration: {
		embeddingModelArn: string
	}
}

type fieldmapconfig = {
	metadataField: string
	textField: string
}

type storepineconfig = {
	connectionString: string
	credentialsSecretArn: string
	fieldMapping: fieldmapconfig
	namespace: string
}

type pinestoreconfig = {
	pineconeConfiguration: storepineconfig
	type: string
}
type pineconeConfig = {
	clientToken: string
	description: string
	knowledgeBaseConfiguration: kbconfig
	name: string
	roleArn: string
	storageConfiguration: pinestoreconfig
}
//* https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_CreateKnowledgeBase.html
export function request(ctx: Context) {
	const idempotencyKey = util.autoId()
	return {
		method: 'PUT',
		resourcePath: '/knowledgebases',
		params: {
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				clientToken: idempotencyKey,
				description: 'sample app',
				knowledgeBaseConfiguration: {
					type: 'VECTOR',
					vectorKnowledgeBaseConfiguration: {
						embeddingModelArn: ctx.env.EMBEDDING_MODEL_ARN,
					},
				},
				name: ctx.args.name,
				roleArn: ctx.env.ROLE_ARN_FOR_KNOWLEDGEBASE,
				storageConfiguration: {
					pineconeConfiguration: {
						connectionString: ctx.env.PINECONE_CONNECTION_STRING,
						credentialsSecretArn: ctx.env.PINECONE_SECRET_ARN,
						fieldMapping: {
							metadataField: 'metadater',
							textField: 'metadatertext',
						},
						namespace: 'bedrocknamer',
					},
					type: 'PINECONE',
				},
			} as pineconeConfig,
		},
	}
}

export function response(ctx: Context) {
	console.log('the reponse', ctx)
	return ctx.result.body
}
