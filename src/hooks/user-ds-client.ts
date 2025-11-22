import { useState, useMemo, useCallback } from "react"
import { WebCredentialProvider } from "@ds-sdk/client"
import { DropzoneService, ResponseService } from "@ds-sdk/sypher"

// Shared default client options
const defaultOptions = {
  useBinaryFormat: false,
}

// Correct client types
type ResponseClient = ReturnType<typeof ResponseService.createClient>
type DropzoneClient = ReturnType<typeof DropzoneService.createClient>

interface UseDsClientsReturn {
  region: string
  domain: string

  updateRegion: (newRegion: string) => void
  updateDomain: (newDomain: string) => void

  responseClient: ResponseClient
  responseClientWithoutRedirection: ResponseClient

  dropzoneClient: DropzoneClient
  dropzoneClientWithoutRedirection: DropzoneClient
}

export function useDsClients(
  initialRegion: string = "us",
  initialDomain: string = "dev.defencestation.ca"
): UseDsClientsReturn {
  const [region, setRegion] = useState(initialRegion)
  const [domain, setDomain] = useState(initialDomain)

  // Rebuild config whenever region/domain changes
  const config = useMemo(() => ({ region, domain }), [region, domain])

  // Credentials
  const clientCredentials = useMemo(
    () => new WebCredentialProvider({ redirectOnFail: undefined }),
    []
  )

  const clientCredentialsWithoutRedirection = useMemo(
    () => new WebCredentialProvider({}),
    []
  )

  // Response clients
  const responseClient = useMemo(
    () =>
      ResponseService.createClient(config, clientCredentials, [], defaultOptions),
    [config, clientCredentials]
  )

  const responseClientWithoutRedirection = useMemo(
    () =>
      ResponseService.createClient(
        config,
        clientCredentialsWithoutRedirection,
        [],
        defaultOptions
      ),
    [config, clientCredentialsWithoutRedirection]
  )

  // Dropzone clients
  const dropzoneClient = useMemo(
    () =>
      DropzoneService.createClient(config, clientCredentials, [], defaultOptions),
    [config, clientCredentials]
  )

  const dropzoneClientWithoutRedirection = useMemo(
    () =>
      DropzoneService.createClient(
        config,
        clientCredentialsWithoutRedirection,
        [],
        defaultOptions
      ),
    [config, clientCredentialsWithoutRedirection]
  )

  // Actions
  const updateRegion = useCallback((newRegion: string) => {
    setRegion(newRegion)
  }, [])

  const updateDomain = useCallback((newDomain: string) => {
    setDomain(newDomain)
  }, [])

  return {
    region,
    domain,
    updateRegion,
    updateDomain,

    responseClient,
    responseClientWithoutRedirection,

    dropzoneClient,
    dropzoneClientWithoutRedirection,
  }
}
