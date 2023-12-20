import { accessDropzoneMut, accessRequestMut, createResponseMut, createResponseWithLimitMut } from "../graphql/mutations";
import { getAuthInfoQuery } from "../graphql/queries";

export const accessRequest = async (client, variables) => {
   const data = await client.mutate({
    mutation: accessRequestMut,
    variables: variables
   }) 
   return data?.data?.sypher_v1_AccessRequest;
};

export const accessDropzone = async (client, variables) => {
    const data = await client.mutate({
     mutation: accessDropzoneMut,
     variables: variables
    }) 
    return data?.data?.sypher_v1_AccessDropzone;
 };

export const getUser = async (client) => {
    const authResponse = await client.query({
        query: getAuthInfoQuery,
        fetchPolicy: "network-only"
    })
    return authResponse?.data?.iam_v1_GetAuthInfo?.user;
}


export const createResponse = async (client, variables) => {
    const data = await client.mutate({
        mutation: createResponseMut,
        variables: variables
       }) 
       return data?.data?.sypher_v1_CreateResponse;
}

export const createResponseWithLimit = async (client, variables) => {
    const data = await client.mutate({
        mutation: createResponseWithLimitMut,
        variables: variables
       }) 
       return data?.data?.sypher_v1_CreateResponse;
}