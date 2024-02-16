/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type StartIngestionJobInput = {
  knowledgeBaseId: string,
  dataSourceId: string,
};

export type GetIngestionJobStatusInput = {
  ingestionJobId: string,
  knowledgeBaseId: string,
  dataSourceId: string,
};

export type CreateKnowledgeBaseWithDataSourceMutationVariables = {
  name: string,
};

export type CreateKnowledgeBaseWithDataSourceMutation = {
  createKnowledgeBaseWithDataSource: string,
};

export type StartIngestionJobMutationVariables = {
  input: StartIngestionJobInput,
};

export type StartIngestionJobMutation = {
  startIngestionJob: string,
};

export type GetIngestionJobStatusQueryVariables = {
  input: GetIngestionJobStatusInput,
};

export type GetIngestionJobStatusQuery = {
  getIngestionJobStatus: string,
};
