import React from "react"
import { Container, Jumbotron, Nav, Navbar } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { HashRouter, Route, Switch } from "react-router-dom"
import { LoginForm } from "./components/LoginForm"

export const App = () => {
  return (
    <HashRouter>
      <Container className="p-3">
        <Jumbotron className="m-0">
          <h1 className="header">mobx-form</h1>
        </Jumbotron>
        <Navbar bg="dark" variant="dark">
          <Nav className="mr-auto">
            <LinkContainer to="/">
              <Nav.Link>Login form</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar>
        <Container className="border border-2 p-4 ">
          <Switch>
            <Route path="/">
              <LoginForm />
            </Route>
          </Switch>
        </Container>
      </Container>
    </HashRouter>
  )
}
