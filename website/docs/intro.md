---
sidebar_position: 1
---

# Overview

**@mozartspa/mobx-react** is a high performance, hook-based forms library for React, powered by MobX.

## Features

- Form level and Field level validation with built-in async debouncing
- Supports multiple error messages per field
- Deeply nested form values (arrays, you're welcome)
- Format and parse values (to support advanced scenarios)
- Powered by [MobX](https://mobx.js.org/)
- Built with React hooks
- Written in Typescript
- [![Minzipped Size](https://badgen.net/bundlephobia/minzip/@mozartspa/mobx-form)](https://bundlephobia.com/package/@mozartspa/mobx-form)

## Motivation

Why another form library? Simple, I have not found _easy to use_ form libraries that leveraged the high performance of mobx. The mostly used form libraries don't use MobX underneath, and they struggle between performance and ease of use. With MobX you can have both.

## Installation

```bash
yarn add @mozartspa/mobx-form
```

Then install the peer-dependencies: [mobx](https://github.com/mobxjs/mobx) and [mobx-react-lite](https://github.com/mobxjs/mobx/tree/main/packages/mobx-react-lite)

```bash
yarn add mobx mobx-react-lite
```

## Getting started

[Start creating your first form](getting-started/create-form.md).

## Credits

Heavily inspired by [formik](https://github.com/formium/formik), with some ideas taken from [react-form](https://github.com/tannerlinsley/react-form) and [react-final-form](https://github.com/final-form/react-final-form).
