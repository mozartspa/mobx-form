(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[671],{3905:function(e,t,n){"use strict";n.d(t,{Zo:function(){return p},kt:function(){return d}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var m=r.createContext({}),s=function(e){var t=r.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(m.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,m=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=s(n),d=a,b=c["".concat(m,".").concat(d)]||c[d]||u[d]||o;return n?r.createElement(b,i(i({ref:t},p),{},{components:n})):r.createElement(b,i({ref:t},p))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=c;var l={};for(var m in t)hasOwnProperty.call(t,m)&&(l[m]=t[m]);l.originalType=e,l.mdxType="string"==typeof e?e:a,i[1]=l;for(var s=2;s<o;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},426:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return l},metadata:function(){return m},toc:function(){return s},default:function(){return u}});var r=n(2122),a=n(9756),o=(n(7294),n(3905)),i=["components"],l={sidebar_position:1},m={unversionedId:"intro",id:"intro",isDocsHomePage:!1,title:"Overview",description:"@mozartspa/mobx-react is a high performance, hook-based forms library for React, powered by MobX.",source:"@site/docs/intro.md",sourceDirName:".",slug:"/intro",permalink:"/mobx-form/docs/intro",editUrl:"https://github.com/mozartspa/mobx-form/edit/master/website/docs/intro.md",version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",next:{title:"Create a Form",permalink:"/mobx-form/docs/getting-started/create-form"}},s=[{value:"Features",id:"features",children:[]},{value:"Motivation",id:"motivation",children:[]},{value:"Installation",id:"installation",children:[]},{value:"Getting started",id:"getting-started",children:[]}],p={toc:s};function u(e){var t=e.components,n=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"@mozartspa/mobx-react")," is a high performance, hook-based forms library for React, powered by MobX."),(0,o.kt)("h2",{id:"features"},"Features"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Form level and Field level validation with built-in async debouncing"),(0,o.kt)("li",{parentName:"ul"},"Supports multiple error messages per field"),(0,o.kt)("li",{parentName:"ul"},"Deeply nested form values (arrays, you're welcome)"),(0,o.kt)("li",{parentName:"ul"},"Format and parse values (to support advanced scenarios)"),(0,o.kt)("li",{parentName:"ul"},"Powered by ",(0,o.kt)("a",{parentName:"li",href:"https://mobx.js.org/"},"MobX")),(0,o.kt)("li",{parentName:"ul"},"Built with React hooks"),(0,o.kt)("li",{parentName:"ul"},"Written in Typescript"),(0,o.kt)("li",{parentName:"ul"},"It's only ",(0,o.kt)("a",{parentName:"li",href:"https://bundlephobia.com/package/@mozartspa/mobx-form"},"~7kB gzipped"))),(0,o.kt)("h2",{id:"motivation"},"Motivation"),(0,o.kt)("p",null,"Why another form library? Simple, I have not found ",(0,o.kt)("em",{parentName:"p"},"easy to use")," form libraries that leveraged the high performance of mobx. The mostly used form libraries don't use MobX underneath, and they struggle between performance and ease of use. With MobX you can have both."),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @mozartspa/mobx-form\n")),(0,o.kt)("p",null,"Then install the peer-dependencies: ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/mobxjs/mobx"},"mobx")," and ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/mobxjs/mobx/tree/main/packages/mobx-react-lite"},"mobx-react-lite")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add mobx mobx-react-lite\n")),(0,o.kt)("h2",{id:"getting-started"},"Getting started"),(0,o.kt)("p",null,"A minimal example, not exactly what you would use in a real project, but it gives an overall look:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},'import React from "react"\nimport { observer } from "mobx-react-lite"\nimport { useField, useForm } from "@mozartspa/mobx-form"\n\nconst App = observer(() => {\n  const form = useForm({\n    initialValues: {\n      name: "",\n    },\n    onSubmit: (values) => {\n      console.log("submitted values", values)\n    },\n  })\n\n  const nameField = useField("name", { form })\n\n  return (\n    <form onSubmit={form.handleSubmit}>\n      <div>\n        <label>Name</label>\n        <input type="text" {...nameField.input} />\n        {nameField.isTouched && nameField.error}\n      </div>\n      <button type="submit">Submit</button>\n    </form>\n  )\n})\n\nexport default App\n')),(0,o.kt)("p",null,"Few things to note:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"We import ",(0,o.kt)("inlineCode",{parentName:"li"},"useForm")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"useField")," from the package ",(0,o.kt)("inlineCode",{parentName:"li"},"@mozartspa/mobx-form"),"."),(0,o.kt)("li",{parentName:"ul"},"We wrap our component with ",(0,o.kt)("a",{parentName:"li",href:"https://mobx.js.org/react-integration.html"},(0,o.kt)("inlineCode",{parentName:"a"},"observer()")),", since we're using MobX."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"useForm()")," gives us back a stable reference to our form instance."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"useField()")," gives us back a stable reference to a specific field of our form. We pass it the ",(0,o.kt)("inlineCode",{parentName:"li"},"form")," instance, to make it know which form it should be bound to. It's required here, but in other examples we'll leverage the React Context."),(0,o.kt)("li",{parentName:"ul"},"With ",(0,o.kt)("inlineCode",{parentName:"li"},"onSubmit={form.handleSubmit}")," we let our form instance handle the onSubmit event."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"{...nameField.input}")," gives the input the necessary props to be a controlled input: ",(0,o.kt)("inlineCode",{parentName:"li"},"name"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"value"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"onChange"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"onBlur"),"."),(0,o.kt)("li",{parentName:"ul"},"With ",(0,o.kt)("inlineCode",{parentName:"li"},"{nameField.isTouched && nameField.error}")," we display the possible error only after the user ",(0,o.kt)("em",{parentName:"li"},"touched")," the input. Anyway, in this case there's no input validation.")))}u.isMDXComponent=!0}}]);