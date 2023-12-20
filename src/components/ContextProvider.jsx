import React from 'react'
import ReadResponseProvider from '../context/read-dropzone-context'
import SubmitDataProvider from '../context/submit-data'

export default function ContextProvider({children}) {
  return (
    <SubmitDataProvider>
      <ReadResponseProvider>
          {children}
      </ReadResponseProvider>
    </SubmitDataProvider>
  )
}
