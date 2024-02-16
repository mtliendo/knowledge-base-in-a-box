/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type StartIngestionJobInput = {
  knowledgeBaseId: string,
  dataSourceId: string,
};

export type RetrieveAndGenerateResponseInput = {
  text: string,
  knowledgeBaseId: string,
  sessionId?: string | null,
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

export type RetrieveAndGenerateResponseMutationVariables = {
  input: RetrieveAndGenerateResponseInput,
};

export type RetrieveAndGenerateResponseMutation = {
  retrieveAndGenerateResponse?: string | null,
};

export type GetIngestionJobStatusQueryVariables = {
  input: GetIngestionJobStatusInput,
};

export type GetIngestionJobStatusQuery = {
  getIngestionJobStatus: string,
};
