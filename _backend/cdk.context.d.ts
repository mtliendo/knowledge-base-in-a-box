export type CDKContext =
	| {
			appName: string
			region: string
			pineconeConnectionString: string
			pineconeSecretArn: string
			foundationModelArn: string
			embeddingModelArn: string
	  }
	| undefined
