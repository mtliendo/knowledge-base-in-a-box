import { createAppSyncAPI } from './api/appsync'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createSkillsBucket } from './storage/skillsBucket'

export class KnowlegeBaseBackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)
		const appName = 'knowlege-base-app'
		const pineconeConnectionString =
			'https://quickstart-bedrock-h32akzb.svc.apw5-4e34-81fa.pinecone.io'
		const pineconeSecretArn =
			'arn:aws:secretsmanager:us-east-1:842537737558:secret:pineconekbserverless-AhIREU'
		const bucket = createSkillsBucket(this, {
			appName,
		})

		const api = createAppSyncAPI(this, {
			appName,
			pineconeSecretArn,
			pineconeConnectionString,
			bucketArn: bucket.bucketArn,
		})
	}
}
