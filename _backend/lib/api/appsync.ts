import * as path from 'path'
import * as awsAppsync from 'aws-cdk-lib/aws-appsync'
import * as awsIam from 'aws-cdk-lib/aws-iam'
import { Stack } from 'aws-cdk-lib'
import { IUserPool } from 'aws-cdk-lib/aws-cognito'

//Props needing to be passed to create the AppSync API and deps
type AppSyncAPIProps = {
	appName: string
	bucketArn: string
	pineconeConnectionString: string
	pineconeSecretArn: string
	foundationModelArn: string
	embeddingModelArn: string
	userpool: IUserPool
}

// function to create the appsync API and needed deps
export const createAppSyncAPI = (scope: Stack, props: AppSyncAPIProps) => {
	//* L2 construct to create the AppSync API. Includes logging to cloudwatch
	const api = new awsAppsync.GraphqlApi(scope, `${props.appName}`, {
		name: props.appName,
		definition: awsAppsync.Definition.fromFile(
			path.join(__dirname, 'schema.graphql')
		),
		authorizationConfig: {
			defaultAuthorization: {
				authorizationType: awsAppsync.AuthorizationType.USER_POOL,
				userPoolConfig: {
					userPool: props.userpool,
				},
			},
		},
		logConfig: {
			fieldLogLevel: awsAppsync.FieldLogLevel.ALL,
		},
	})

	//* Init AppSync HTTP datasource endpoints

	// How I knew it was "bedrock-agent":
	// https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html
	const bedrockKnowledgeBaseDataSource = api.addHttpDataSource(
		'bedrockDS',
		`https://bedrock-agent.${scope.region}.amazonaws.com`,
		{
			authorizationConfig: {
				signingRegion: scope.region,
				signingServiceName: 'bedrock',
			},
		}
	)

	// How I knew it was "bedrock-agent-runtime":
	// https://docs.aws.amazon.com/bedrock/latest/APIReference/API_Operations_Agents_for_Amazon_Bedrock_Runtime.html
	const bedrockRetrieveAndGenerateDS = api.addHttpDataSource(
		'bedrockRetrieveAndGenerateDS',
		`https://bedrock-agent-runtime.${scope.region}.amazonaws.com`,
		{
			authorizationConfig: {
				signingRegion: scope.region,
				signingServiceName: 'bedrock',
			},
		}
	)

	//* Init roles and policies

	//The role for the appSync datasource to pass to Bedrock
	const roleForKnowledgeBase = new awsIam.Role(scope, `${props.appName}-role`, {
		assumedBy: new awsIam.ServicePrincipal('bedrock.amazonaws.com'),
		roleName: `AmazonBedrockExecutionRoleForKnowledgeBase_${props.appName}`,
		inlinePolicies: {
			invokeTitanEmbed: new awsIam.PolicyDocument({
				statements: [
					new awsIam.PolicyStatement({
						actions: ['bedrock:InvokeModel'],
						resources: [props.embeddingModelArn],
					}),
					new awsIam.PolicyStatement({
						actions: ['secretsmanager:GetSecretValue'],
						resources: [props.pineconeSecretArn],
					}),
					new awsIam.PolicyStatement({
						actions: ['s3:ListBucket'],
						resources: [props.bucketArn],
					}),
					new awsIam.PolicyStatement({
						actions: ['s3:GetObject'],
						resources: [`${props.bucketArn}/protected/*`],
					}),
				],
			}),
		},
	})

	// let the datasource pass the above IAM role to bedrock
	bedrockKnowledgeBaseDataSource.grantPrincipal.addToPrincipalPolicy(
		new awsIam.PolicyStatement({
			resources: [roleForKnowledgeBase.roleArn],
			actions: ['iam:PassRole'],
		})
	)

	bedrockKnowledgeBaseDataSource.grantPrincipal.addToPrincipalPolicy(
		new awsIam.PolicyStatement({
			resources: ['*'],
			actions: [
				'bedrock:CreateKnowledgeBase',
				'bedrock:AssociateThirdPartyKnowledgeBase',
				'bedrock:CreateDataSource',
				'bedrock:StartIngestionJob',
				'bedrock:GetIngestionJob',
			],
		})
	)

	bedrockRetrieveAndGenerateDS.grantPrincipal.addToPrincipalPolicy(
		new awsIam.PolicyStatement({
			resources: [
				`arn:aws:bedrock:${scope.region}::foundation-model/anthropic.claude-v2`,
			],
			actions: ['bedrock:InvokeModel'],
		})
	)
	bedrockRetrieveAndGenerateDS.grantPrincipal.addToPrincipalPolicy(
		new awsIam.PolicyStatement({
			resources: [`*`],
			actions: ['bedrock:Retrieve', 'bedrock:RetrieveAndGenerate'],
		})
	)

	//* Init Adding envVars

	// Dropping down to L1 construct until this is merged:
	// https://github.com/aws/aws-cdk/pull/29064
	const cfnAPI = api.node.defaultChild as awsAppsync.CfnGraphQLApi
	cfnAPI.environmentVariables = {
		EMBEDDING_MODEL_ARN: props.embeddingModelArn,
		ROLE_ARN_FOR_KNOWLEDGEBASE: roleForKnowledgeBase.roleArn,
		BUCKET_ARN: props.bucketArn,
		PINECONE_CONNECTION_STRING: props.pineconeConnectionString,
		PINECONE_SECRET_ARN: props.pineconeSecretArn,
		FOUNDATION_MODEL_ARN: props.foundationModelArn,
	}

	//* Init AppSync resolvers
	const retrieveAndGenerateResponseResolver = api.createResolver(
		'retrieveAndGenerateResponseResolver',
		{
			typeName: 'Mutation',
			fieldName: 'retrieveAndGenerateResponse',
			dataSource: bedrockRetrieveAndGenerateDS,
			runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
			code: awsAppsync.Code.fromAsset(
				path.join(__dirname, 'JS_Functions/retrieveAndGenerateResponse.js')
			),
		}
	)
	const createStartIngestionJobFunc = api.createResolver(
		'createStartIngestionJobFunc',
		{
			typeName: 'Mutation',
			fieldName: 'startIngestionJob',
			dataSource: bedrockKnowledgeBaseDataSource,
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
			dataSource: bedrockKnowledgeBaseDataSource,
			runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
			code: awsAppsync.Code.fromAsset(
				path.join(__dirname, 'JS_Functions/createGetIngestionJobStatus.js')
			),
		}
	)

	const createKnowledgeBaseFunc = bedrockKnowledgeBaseDataSource.createFunction(
		'createKnowledgeBaseFunc',
		{
			name: 'createKnowledgeBaseFunc',
			runtime: awsAppsync.FunctionRuntime.JS_1_0_0,
			code: awsAppsync.Code.fromAsset(
				path.join(__dirname, 'JS_Functions/createKnowledgeBase.js')
			),
		}
	)
	const createKnowledgeBaseDatasourceFunc =
		bedrockKnowledgeBaseDataSource.createFunction(
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

	return api
}

/* todo:
//* 1. cleanup code (minimize policies, ensure envvars and props are where they need to be, etc) ✅
//* 2. add values to context api✅
//* 3. add in cognito and update s3 permissions
//* 4. create frontend: landing page, auth page, chat interface for signed in users, admin page to configure storage
//* 5. add hosting
//* 6. document
*/
