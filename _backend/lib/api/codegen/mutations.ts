/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createKnowledgeBaseWithDataSource = /* GraphQL */ `mutation CreateKnowledgeBaseWithDataSource($name: String!) {
  createKnowledgeBaseWithDataSource(name: $name)
}
` as GeneratedMutation<
  APITypes.CreateKnowledgeBaseWithDataSourceMutationVariables,
  APITypes.CreateKnowledgeBaseWithDataSourceMutation
>;
export const startIngestionJob = /* GraphQL */ `mutation StartIngestionJob($input: StartIngestionJobInput!) {
  startIngestionJob(input: $input)
}
` as GeneratedMutation<
  APITypes.StartIngestionJobMutationVariables,
  APITypes.StartIngestionJobMutation
>;
