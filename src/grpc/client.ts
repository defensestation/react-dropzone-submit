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

export const responseClient = ResponseService.createClient(config, clientCredentials, [], options)
export const responseClientWithoutRedirection = ResponseService.createClient(config, clientCredentialsWithoutRedirection, [], options)
export const dropzoneClient = DropzoneService.createClient(config, clientCredentials, [], options)
export const dropzoneClientWithoutRedirection = DropzoneService.createClient(config, clientCredentialsWithoutRedirection, [], options)

export const changeRegion = (region: string) => {
  config.region = region
}