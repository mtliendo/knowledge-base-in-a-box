import { createAppSyncAPI } from './api/appsync'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createSkillsBucket } from './storage/skillsBucket'
import { CDKContext } from '../cdk.context'
import { createAuth } from './auth/cognito'

export class KnowlegeBaseBackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const context: CDKContext = this.node.tryGetContext('globals')

		if (!context) {
			throw new Error('Missing context')
		}

		const auth = createAuth(this, {
			appName: context.appName,
		})

		const bucket = createSkillsBucket(this, {
			appName: context.appName,
			authenticatedRole: auth.identityPool.authenticatedRole,
		})

		const api = createAppSyncAPI(this, {
			appName: context.appName,
			pineconeSecretArn: context.pineconeSecretArn,
			pineconeConnectionString: context.pineconeConnectionString,
			bucketArn: bucket.bucketArn,
			foundationModelArn: context.foundationModelArn,
			embeddingModelArn: context.embeddingModelArn,
			userpool: auth.userPool,
		})
	}
}
