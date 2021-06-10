import React from "react"
import { Container, Jumbotron, Nav, Navbar } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { HashRouter, Route, Switch } from "react-router-dom"
import { ArrayForm } from "./components/ArrayForm"
import { LoginForm } from "./components/LoginForm"
import { PerformantForm } from "./components/PerformantForm"

export const App = () => {
  return (
    <HashRouter>
      <Container className="p-3">
        <Jumbotron className="m-0">
          <h1 className="header">mobx-form</h1>
        </Jumbotron>
        <Navbar bg="dark" variant="dark">
          <Nav className="mr-auto">
            <LinkContainer to="/" exact>
              <Nav.Link>Login form</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/performant-form">
              <Nav.Link>Performant form</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/array-form">
              <Nav.Link>Array form</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar>
        <Container className="border border-2 p-4 ">
          <Switch>
            <Route path="/array-form">
              <ArrayForm />
            </Route>
            <Route path="/performant-form">
              <PerformantForm />
            </Route>
            <Route path="/">
              <LoginForm />
            </Route>
          </Switch>
        </Container>
      </Container>
    </HashRouter>
  )
}
