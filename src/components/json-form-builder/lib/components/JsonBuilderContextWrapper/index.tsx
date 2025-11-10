import React from 'react'
import JSONBuilderProvider from '../../context/dnd-context'

interface JsonBuilderContextProps extends React.PropsWithChildren {

}

export default function JsonBuilderContext({children}: JsonBuilderContextProps): React.ReactElement {
  return (
    <JSONBuilderProvider>
        {children}
    </JSONBuilderProvider>
  )
}
