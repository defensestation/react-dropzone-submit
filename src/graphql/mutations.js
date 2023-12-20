import { gql } from "@apollo/client";

export const accessRequestMut = gql`
  mutation MyMutation($request_id: String = "") {
    sypher_v1_AccessRequest(input: { request_id: $request_id }) {
      request {
        access_limit
        account_id
        created_at
        enable_notifications
        enc_dec_key
        enc_key
        end_date
        hide_identity
        hide_stats
        label
        login_required
        message
        request_id
        respondent_id
        responder_controls
        start_date
        template {
          data
          signer_files
        }
        username
      }
      session
    }
  }
`;

export const createResponseMut = gql`
  mutation MyMutation(
    $session: String = ""
    $files: [api_sypher_v1_File_Input] = {}
  ) {
    sypher_v1_CreateResponse(input: { session: $session, files: $files }) {
      signed_urls
    }
  }
`;

export const createResponseWithLimitMut = gql`
  mutation MyMutation(
    $session: String = ""
    $files: [api_sypher_v1_File_Input] = {}
    $start_date: String = ""
    $end_date: String = ""
    $access_limit: Int = 10
  ) {
    sypher_v1_CreateResponse(
      input: {
        session: $session
        files: $files
        access_limit: $access_limit
        end_date: $end_date
        start_date: $start_date
      }
    ) {
      signed_urls
    }
  }
`;

export const accessDropzoneMut = gql`
  mutation MyMutation(
    $dropzone_id: String = ""
    $dropzone_key: String = ""
    $password: String = ""
    $respondent_id: String = ""
  ) {
    sypher_v1_AccessDropzone(
      input: {
        dropzone_id: $dropzone_id
        dropzone_key: $dropzone_key
        password: $password
        respondent_id: $respondent_id
      }
    ) {
      dropzone {
        account_id
        allowed_origins
        created_at
        description
        dropzone_id
        dropzone_key
        dropzone_name
        enc_dec_key
        enc_key
        end_date
        password
        login_required
        responder_controls
        start_date
        template {
          data
          signer_files
        }
        username
      }
      session
    }
  }
`;
