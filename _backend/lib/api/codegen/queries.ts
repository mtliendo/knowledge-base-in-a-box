/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getIngestionJobStatus = /* GraphQL */ `query GetIngestionJobStatus($input: GetIngestionJobStatusInput!) {
  getIngestionJobStatus(input: $input)
}
` as GeneratedQuery<
  APITypes.GetIngestionJobStatusQueryVariables,
  APITypes.GetIngestionJobStatusQuery
>;
