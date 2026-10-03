function n(r){return typeof r=="string"?{one:r,other:`${r}s`}:r}function a(r,t){const{one:e,other:o}=n(t);return r===1?e:o}function i(r,t){return`${r.toLocaleString()} ${a(r,t)}`}export{a,i as p};
