import { gql } from "@apollo/client";

export const getAuthInfoQuery = gql`
query MyQuery {
    iam_v1_GetAuthInfo {
      user {
        account_id
        account_type
        antiphish_token
        billing_status
        created_at
        email
        first_name
        last_name
        permissions
        updated_at
        user_type
        username
      }
    }
  }
`
