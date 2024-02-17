import * as s3 from 'aws-cdk-lib/aws-s3'
import {
	Effect,
	IRole,
	ManagedPolicy,
	PolicyStatement,
} from 'aws-cdk-lib/aws-iam'
import { Stack } from 'aws-cdk-lib'

type CreateSkillsBucketProps = {
	authenticatedRole: IRole
	appName: String
}

export function createSkillsBucket(
	scope: Stack,
	props: CreateSkillsBucketProps
) {
	const fileStorageBucket = new s3.Bucket(scope, `${props.appName}Bucket`, {
		cors: [
			{
				allowedMethods: [
					s3.HttpMethods.POST,
					s3.HttpMethods.PUT,
					s3.HttpMethods.GET,
					s3.HttpMethods.DELETE,
					s3.HttpMethods.HEAD,
				],
				allowedOrigins: ['*'],
				allowedHeaders: ['*'],
				exposedHeaders: [
					'x-amz-server-side-encryption',
					'x-amz-request-id',
					'x-amz-id-2',
					'ETag',
				],
			},
		],
	})

	// Let signed in users Upload on their own objects in a protected directory
	const canUpdateAndReadFromOwnProtectedDirectory = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['s3:PutObject', 's3:GetObject'],
		resources: [
			`arn:aws:s3:${scope.region}::${fileStorageBucket.bucketName}/protected/\${cognito-identity.amazonaws.com:sub}/*`,
		],
	})

	new ManagedPolicy(scope, 'SignedInUserManagedPolicy-test', {
		description:
			'managed Policy to allow upload access to s3 bucket by signed in users.',
		statements: [canUpdateAndReadFromOwnProtectedDirectory],
		roles: [props.authenticatedRole],
	})

	return fileStorageBucket
}
