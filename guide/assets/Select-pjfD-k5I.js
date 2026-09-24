import{l as x,j as e}from"./index-DmGUg6zR.js";const b=({value:d,onChange:n,options:o,label:s,ariaLabel:i,error:a,disabled:c=!1,fullWidth:t=!0,className:u=""})=>{const r=x.useId(),m=`
    px-3 py-2 text-sm
    border rounded-md
    transition-all duration-(--dur-instant)
    focus:outline-2 focus:outline-offset-2 focus:outline-primary
    disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
    bg-white
    ${a?"border-danger focus:border-danger":"border-neutral-300 focus:border-primary"}
    ${t?"w-full":""}
  `.trim().replace(/\s+/g," ");return e.jsxs("div",{className:`${t?"w-full":""} ${u}`,children:[s&&e.jsx("label",{htmlFor:r,className:"block text-sm font-medium text-neutral-700 mb-2",children:s}),e.jsx("select",{id:r,value:d,onChange:l=>n(l.target.value),disabled:c,"aria-label":i,className:m,style:{fontFamily:"var(--font-primary)"},children:o.map(l=>e.jsx("option",{value:l.value,children:l.label},l.value))}),a&&e.jsxs("p",{className:"mt-1 text-xs text-red-600 flex items-center gap-1",children:[e.jsx("svg",{className:"w-3.5 h-3.5",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",clipRule:"evenodd"})}),a]})]})};export{b as S};
