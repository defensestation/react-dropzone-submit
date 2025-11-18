import { WebCredentialProvider, ClientConfig } from "@ds-sdk/client"
import { DropzoneService, ResponseService } from "@ds-sdk/sypher"

export const config: ClientConfig = {
  region: "us",
  domain: "dev.defencestation.ca",
}

const options = {
  useBinaryFormat: false
};

console.log("Setting the dev environment variable.", import.meta.env.DEV)

const clientCredentials = new WebCredentialProvider({
  redirectOnFail: undefined,
})

const clientCredentialsWithoutRedirection = new WebCredentialProvider({
})

export type ResponseClient = ReturnType<typeof ResponseService.createClient>;
export type DropzoneClient = ReturnType<typeof DropzoneService.createClient>;

export const responseClient: ResponseClient = ResponseService.createClient(config, clientCredentials, [], options)
export const responseClientWithoutRedirection: ResponseClient = ResponseService.createClient(config, clientCredentialsWithoutRedirection, [], options)
export const dropzoneClient: DropzoneClient = DropzoneService.createClient(config, clientCredentials, [], options)
export const dropzoneClientWithoutRedirection: DropzoneClient = DropzoneService.createClient(config, clientCredentialsWithoutRedirection, [], options)

export const changeRegion = (region: string) => {
  config.region = region
}