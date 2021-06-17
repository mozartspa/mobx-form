(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[121],{3905:function(e,t,n){"use strict";n.d(t,{Zo:function(){return u},kt:function(){return f}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),l=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},u=function(e){var t=l(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),m=l(n),f=o,d=m["".concat(s,".").concat(f)]||m[f]||c[f]||i;return n?r.createElement(d,p(p({ref:t},u),{},{components:n})):r.createElement(d,p({ref:t},u))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,p=new Array(i);p[0]=m;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a.mdxType="string"==typeof e?e:o,p[1]=a;for(var l=2;l<i;l++)p[l]=n[l];return r.createElement.apply(null,p)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},2696:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return a},metadata:function(){return s},toc:function(){return l},default:function(){return c}});var r=n(2122),o=n(9756),i=(n(7294),n(3905)),p=["components"],a={sidebar_position:8},s={unversionedId:"api/splitFieldProps",id:"api/splitFieldProps",isDocsHomePage:!1,title:"splitFieldProps",description:"A utility function that takes some props and splits them into:",source:"@site/docs/api/splitFieldProps.md",sourceDirName:"api",slug:"/api/splitFieldProps",permalink:"/mobx-form/docs/api/splitFieldProps",editUrl:"https://github.com/mozartspa/mobx-form/edit/master/website/docs/api/splitFieldProps.md",version:"current",sidebarPosition:8,frontMatter:{sidebar_position:8},sidebar:"tutorialSidebar",previous:{title:"<DebugForm />",permalink:"/mobx-form/docs/api/DebugForm"}},l=[],u={toc:l};function c(e){var t=e.components,n=(0,o.Z)(e,p);return(0,i.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"A utility function that takes some props and splits them into:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"name of the field"),(0,i.kt)("li",{parentName:"ul"},"options that can be passed to ",(0,i.kt)("inlineCode",{parentName:"li"},"useField()")),(0,i.kt)("li",{parentName:"ul"},"the rest of the props")),(0,i.kt)("p",null,"It's very useful for creating custom components that receive props that can be passed directly to ",(0,i.kt)("inlineCode",{parentName:"p"},"useField()")," (or ",(0,i.kt)("inlineCode",{parentName:"p"},"<Field />"),")."),(0,i.kt)("p",null,"For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript",metastring:"{4-5,10,16-17,19}","{4-5,10,16-17,19}":!0},'import React from "react"\nimport { observer } from "mobx-react-lite"\nimport {\n  FieldComponentProps,\n  splitFieldProps,\n  useField,\n  useForm,\n} from "@mozartspa/mobx-form"\n\ntype InputProps = FieldComponentProps & {\n  label?: string\n  type?: string\n}\n\nconst Input = observer((props: InputProps) => {\n  const [name, fieldOptions, rest] = splitFieldProps(props)\n  const field = useField(name, fieldOptions)\n\n  const { label, type } = rest\n\n  return (\n    <div>\n      <label>{label}</label>\n      <input type={type} {...field.input} />\n      {field.isTouched && field.error}\n    </div>\n  )\n})\n\nconst App = observer(() => {\n  const form = useForm({\n    initialValues: {\n      name: "",\n      age: 36,\n    },\n    onSubmit: (values) => {\n      console.log("submitted values", values)\n    },\n  })\n\n  const { Form } = form\n\n  return (\n    <Form>\n      <Input name="name" label="Your name" />\n      <Input name="age" type="number" label="Your age" />\n      <button type="submit">Submit</button>\n    </Form>\n  )\n})\n\nexport default App\n')))}c.isMDXComponent=!0}}]);