(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[382],{3905:function(e,r,t){"use strict";t.d(r,{Zo:function(){return s},kt:function(){return m}});var n=t(7294);function a(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){a(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function p(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)t=i[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var l=n.createContext({}),c=function(e){var r=n.useContext(l),t=r;return e&&(t="function"==typeof e?e(r):o(o({},r),e)),t},s=function(e){var r=c(e.components);return n.createElement(l.Provider,{value:r},e.children)},u={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},d=n.forwardRef((function(e,r){var t=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,s=p(e,["components","mdxType","originalType","parentName"]),d=c(t),m=a,f=d["".concat(l,".").concat(m)]||d[m]||u[m]||i;return t?n.createElement(f,o(o({ref:r},s),{},{components:t})):n.createElement(f,o({ref:r},s))}));function m(e,r){var t=arguments,a=r&&r.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=d;var p={};for(var l in r)hasOwnProperty.call(r,l)&&(p[l]=r[l]);p.originalType=e,p.mdxType="string"==typeof e?e:a,o[1]=p;for(var c=2;c<i;c++)o[c]=t[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,t)}d.displayName="MDXCreateElement"},434:function(e,r,t){"use strict";t.r(r),t.d(r,{frontMatter:function(){return p},metadata:function(){return l},toc:function(){return c},default:function(){return u}});var n=t(2122),a=t(9756),i=(t(7294),t(3905)),o=["components"],p={sidebar_position:5},l={unversionedId:"api/FieldArray",id:"api/FieldArray",isDocsHomePage:!1,title:"<FieldArray />",description:"Component that is a thin wrapper around useFieldArray.",source:"@site/docs/api/FieldArray.md",sourceDirName:"api",slug:"/api/FieldArray",permalink:"/mobx-form/docs/api/FieldArray",editUrl:"https://github.com/mozartspa/mobx-form/edit/master/website/docs/api/FieldArray.md",version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"<Field />",permalink:"/mobx-form/docs/api/Field"},next:{title:"<FieldScope />",permalink:"/mobx-form/docs/api/FieldScope"}},c=[{value:"Props",id:"props",children:[{value:"name",id:"name",children:[]},{value:"children",id:"children",children:[]}]}],s={toc:c};function u(e){var r=e.components,t=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,n.Z)({},s,t,{components:r,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Component that is a thin wrapper around ",(0,i.kt)("a",{parentName:"p",href:"useFieldArray"},"useFieldArray"),"."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},'import { FieldArray } from "@mozartspa/mobx-form"\n')),(0,i.kt)("h2",{id:"props"},"Props"),(0,i.kt)("p",null,"It has the same props as ",(0,i.kt)("a",{parentName:"p",href:"useFieldArray#usefieldarrayoptions"},"UseFieldArrayOptions"),", plus:"),(0,i.kt)("h3",{id:"name"},"name"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"name: string\n")),(0,i.kt)("p",null,"The name of the field."),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"children"},"children"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"children: (props: UseFieldArrayResult) => ReactElement\n")),(0,i.kt)("p",null,"A function that receives an ",(0,i.kt)("a",{parentName:"p",href:"useFieldArray#usefieldarrayresult"},"array field")," instance and returns a ReactElement."))}u.isMDXComponent=!0}}]);