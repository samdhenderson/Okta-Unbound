import{l as P,j as e}from"./index-DmGUg6zR.js";const E={sm:"px-3 py-1.5 text-xs",md:"px-3 py-2 text-sm",lg:"px-4 py-3 text-sm"},M={sm:"left-3",md:"left-3",lg:"left-4"},O={sm:"right-3",md:"right-3",lg:"right-4"},V={sm:"pl-9",md:"pl-10",lg:"pl-11"},q={sm:"pr-10",md:"pr-11",lg:"pr-12"},A=({value:f,onChange:g,placeholder:h,type:i="text",disabled:v=!1,error:t,label:o,ariaLabel:b,hint:l,fullWidth:c=!0,size:s="md",icon:n,trailing:r,trailingInteractive:m=!1,className:$="",autoFocus:j=!1,onKeyDown:y,onBlur:C,onFocus:I,onSelect:N,combobox:a,inputRef:w})=>{const d=P.useId(),u=`${d}-input`,p=`${d}-hint`,x=`${d}-error`,R=t?x:l?p:void 0,k=`
    ${E[s]}
    border rounded-md bg-white
    transition-all duration-(--dur-instant)
    focus:outline-2 focus:outline-offset-2 focus:outline-primary
    disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
    ${t?"border-danger focus:border-danger":"border-neutral-300 focus:border-primary"}
    ${n?V[s]:""}
    ${r?q[s]:""}
    ${c?"w-full":""}
    ${i==="search"&&m?"[&::-webkit-search-cancel-button]:appearance-none":""}
  `.trim().replace(/\s+/g," "),B=`
    absolute ${O[s]} top-1/2 -translate-y-1/2
    flex items-center text-neutral-400
    ${m?"":"pointer-events-none"}
  `.trim().replace(/\s+/g," ");return e.jsxs("div",{className:`${c?"w-full":""} ${$}`,children:[o&&e.jsx("label",{htmlFor:u,className:"block text-sm font-medium text-neutral-700 mb-2",children:o}),e.jsxs("div",{className:"relative",children:[n&&e.jsx("div",{"aria-hidden":"true",className:`pointer-events-none absolute ${M[s]} top-1/2 -translate-y-1/2 text-neutral-400`,children:n}),e.jsx("input",{ref:w,id:u,type:i,value:f,onChange:F=>g(F.target.value),onKeyDown:y,onBlur:C,onFocus:I,onSelect:N,"aria-label":b,"aria-describedby":R,"aria-invalid":t?!0:void 0,...a?{role:"combobox","aria-expanded":a.expanded,"aria-controls":a.listboxId,"aria-activedescendant":a.activeOptionId,"aria-autocomplete":a.autocomplete??"list",autoComplete:"off"}:{},placeholder:h,disabled:v,autoFocus:j,className:k,style:{fontFamily:"var(--font-primary)"}}),r&&e.jsx("div",{className:B,children:r})]}),l&&!t&&e.jsx("p",{id:p,className:"mt-1 text-xs text-neutral-500",children:l}),t&&e.jsxs("p",{id:x,className:"mt-1 text-xs text-red-600 flex items-center gap-1",children:[e.jsx("svg",{className:"w-3.5 h-3.5",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",clipRule:"evenodd"})}),t]})]})};export{A as I};
