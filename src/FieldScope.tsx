import React, { ReactNode } from "react"

export const FieldScopeContext = React.createContext<string>("")

export type FieldScopeProps = {
  name: string
  children?: ReactNode
}

export const FieldScope: React.FC<FieldScopeProps> = ({ name, children }) => {
  return (
    <FieldScopeContext.Provider value={`${name}.`}>
      {children}
    </FieldScopeContext.Provider>
  )
}
