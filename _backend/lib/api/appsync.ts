import * as path from 'path'
import * as awsAppsync from 'aws-cdk-lib/aws-appsync'
import * as awsIam from 'aws-cdk-lib/aws-iam'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import { Stack } from 'aws-cdk-lib'

type AppSyncAPIProps = {
	appName: string
	// userPool: UserPool
	// // authRole: awsIam.IRole
	// // unauthRole: awsIam.IRole
	// identityPoolId: string
	bucketArn: string
	pineconeConnectionString: string
	pineconeSecretArn: string
}

export const createAppSyncAPI = (scope: Stack, props: AppSyncAPIProps) => {
	const api = new awsAppsync.GraphqlApi(scope, `${props.appName}`, {
		name: props.appName,
		definition: awsAppsync.Definition.fromFile(
			path.join(__dirname, 'schema.graphql')
		),
		authorizationConfig: {
			defaultAuthorization: {
				authorizationType: awsAppsync.AuthorizationType.API_KEY,
			},
		},
		logConfig: {
			fieldLogLevel: awsAppsync.FieldLogLevel.ALL,
		},
	})

	// add bedrock as a data source
	// How I knew it was "bedrock-agent-runtime": https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html
	const bedrockDataSource = api.addHttpDataSource(
		'bedrockDS',
		`https://bedrock-agent.${scope.region}.amazonaws.com`,
		{
			authorizationConfig: {
				signingRegion: scope.region,
				signingServiceName: 'bedrock',
			},
		}
	)

	const roleForKnowledgeBase = new awsIam.Role(scope, `${props.appName}-role`, {
		assumedBy: new awsIam.ServicePrincipal('bedrock.amazonaws.com'),
		roleName: `AmazonBedrockExecutionRoleForKnowledgeBase_${props.appName}`,
		inlinePolicies: {
			invokeTitanEmbed: new awsIam.PolicyDocument({
				statements: [
					new awsIam.PolicyStatement({
						actions: ['bedrock:InvokeModel'],
						resources: [
							`arn:aws:bedrock:${scope.region}::foundation-model/amazon.titan-embed-text-v1`,
						],
					}),
					new awsIam.PolicyStatement({
						resources: [props.pineconeSecretArn],
						actions: ['secretsmanager:GetSecretValue'],
					}),
					new awsIam.PolicyStatement({
						resources: [props.bucketArn],
						actions: ['s3:ListBucket'],
					}),
					new awsIam.PolicyStatement({
						resources: [`${props.bucketArn}/protected/*`],
						actions: ['s3:GetObject'],
					}),
				],
			}),
		},
	})

	const cfnAPI = api.node.defaultChild as awsAppsync.CfnGraphQLApi
	cfnAPI.environmentVariables = {
		EMBEDDING_MODEL_ARN: `arn:aws:bedrock:${scope.region}::foundation-model/amazon.titan-embed-text-v1`,
		ROLE_ARN_FOR_KNOWLEDGEBASE: roleForKnowledgeBase.roleArn,
		BUCKET_ARN: props.bucketArn,
		PINECONE_CONNECTION_STRING: props.pineconeConnectionString,
		PINECONE_SECRET_ARN: props.pineconeSecretArn,
	}

	const createStartIngestionJobFunc = api.createResolver(
		'createStartIngestionJobFunc',
		{
			typeName: 'Mutation',
			fieldName: 'startIngestionJob',
			dataSource: bedrockDataSource,
			runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
			code: awsAppsync.Code.fromAsset(
				path.join(__dirname, 'JS_Functions/createStartIngestionJob.js')
			),
		}
	)
	const createGetIngestionJobStatusFunc = api.createResolver(
		'createGetIngestionJobStatusFunc',
		{
			typeName: 'Query',
			fieldName: 'getIngestionJobStatus',
			dataSource: bedrockDataSource,
			runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
			code: awsAppsync.Code.fromAsset(
				path.join(__dirname, 'JS_Functions/createGetIngestionJobStatus.js')
			),
		}
	)

	const createKnowledgeBaseFunc = bedrockDataSource.createFunction(
		'createKnowledgeBaseFunc',
		{
			name: 'createKnowledgeBaseFunc',
			runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
			code: awsAppsync.Code.fromAsset(
				path.join(__dirname, 'JS_Functions/createKnowledgeBase.js')
			),
		}
	)
	const createKnowledgeBaseDatasourceFunc = bedrockDataSource.createFunction(
		'createKnowledgeBaseDatasourceFunc',
		{
			name: 'createKnowledgeBaseDatasourceFunc',
			runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
			code: awsAppsync.Code.fromAsset(
				path.join(__dirname, 'JS_Functions/createKnowledgeBaseDatasource.js')
			),
		}
	)

	const createKBwithDSResolver = api.createResolver('createKBwithDSResolver', {
		typeName: 'Mutation',
		fieldName: 'createKnowledgeBaseWithDataSource',
		runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
		code: awsAppsync.Code.fromAsset(
			path.join(__dirname, 'JS_Functions/pipeline.js')
		),
		pipelineConfig: [
			createKnowledgeBaseFunc,
			createKnowledgeBaseDatasourceFunc,
		],
	})
	// let the datasource pass an IAM role to bedrock
	bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
		new awsIam.PolicyStatement({
			resources: [roleForKnowledgeBase.roleArn],
			actions: ['iam:PassRole'],
		})
	)

	const allowDatasourceToCreateKnowledgeBase = new awsIam.PolicyStatement({
		resources: ['*'],
		actions: ['bedrock:CreateKnowledgeBase'],
	})

	bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
		allowDatasourceToCreateKnowledgeBase
	)
	const allowDatasourceToAssociateThirdPartyKnowledgeBase =
		new awsIam.PolicyStatement({
			resources: ['*'],
			actions: ['bedrock:AssociateThirdPartyKnowledgeBase'],
		})

	bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
		allowDatasourceToAssociateThirdPartyKnowledgeBase
	)

	const allowDatasourceToCreateKnowledgeBaseDatasource =
		new awsIam.PolicyStatement({
			resources: ['*'],
			actions: ['bedrock:CreateDataSource'],
		})

	bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
		allowDatasourceToCreateKnowledgeBaseDatasource
	)

	const allowDatasourceToStartIngestionJob = new awsIam.PolicyStatement({
		resources: ['*'],
		actions: ['bedrock:StartIngestionJob'],
	})

	bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
		allowDatasourceToStartIngestionJob
	)

	const allowDatasourceToGetIngestionJobStatus = new awsIam.PolicyStatement({
		resources: ['*'],
		actions: ['bedrock:GetIngestionJob'],
	})

	bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
		allowDatasourceToGetIngestionJobStatus
	)

	// const allowDatasourceToRetrieveAndGenerateResponse = new PolicyStatement({
	// 	resources: ['*'],
	// 	actions: ['bedrock:RetrieveAndGenerate'],
	// })

	// bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
	// 	allowDatasourceToRetrieveAndGenerateResponse
	// )

	// const allowDatasourceToCallClaude = new PolicyStatement({
	// 	resources: [
	// 		`arn:aws:bedrock:${scope.region}::foundation-model/anthropic.claude-v2`,
	// 	],
	// 	actions: ['bedrock:InvokeModel'],
	// })

	// bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
	// 	allowDatasourceToCallClaude
	// )

	return api
}
