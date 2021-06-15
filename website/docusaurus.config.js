/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "@mozartspa/mobx-form",
  tagline:
    "High performance, hook-based forms library for React, powered by MobX",
  url: "https://mozartspa.github.io",
  baseUrl: "/mobx-form/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "mozartspa", // Usually your GitHub org/user name.
  projectName: "mobx-form", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "@mozartspa/mobx-form",
      logo: {
        alt: "@mozartspa/mobx-form",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/mozartspa/mobx-form",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting started",
              to: "/docs/getting-started/create-form",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/mozartspa/mobx-form",
            },
          ],
        },
      ],
      copyright: " ",
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/mozartspa/mobx-form/edit/master/website/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
}
