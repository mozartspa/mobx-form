import React from "react"

export const FieldScopeContext = React.createContext<string>("")

export type FieldScopeProps = {
  name: string
}

export const FieldScope: React.FC<FieldScopeProps> = ({ name, children }) => {
  return (
    <FieldScopeContext.Provider value={`${name}.`}>
      {children}
    </FieldScopeContext.Provider>
  )
}
