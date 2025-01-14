import cdkoutput from './_backend/output.json'

const output = cdkoutput['KnowlegeBaseBackendStack']

export const config = {
	Auth: {
		Cognito: {
			userPoolId: process.env.userPoolId || output.UserPoolId,
			userPoolClientId: process.env.userPoolClientId || output.UserPoolClientId,
			identityPoolId: process.env.identityPoolId || output.IdentityPoolId,
		},
	},
	API: {
		GraphQL: {
			endpoint: process.env.apiUrl || output.GraphQLAPIURL,
			region: process.env.region || output.Region,
			defaultAuthMode: 'userPool' as any,
		},
	},
	Storage: {
		S3: {
			bucket: process.env.BucketName || output.BucketName,
			region: process.env.Region || output.Region,
		},
	},
}
