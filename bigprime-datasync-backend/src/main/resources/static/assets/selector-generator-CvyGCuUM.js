import{k as E,I as O,B as f,F as I,r as D,T as p}from"./opentiny-CDvc5Ao9.js";import{_ as S}from"./index-DKCuXY98.js";import{d as V,f as m,Z as P,k as $,ac as M,v as r,w as l,b as i,x as t,I as c,ad as o,z as g,A as k,B as y,O as F,P as G,G as _}from"./vue-vendor-CVIZtogy.js";import{_ as X}from"./index-DXYdVmoq.js";const z={class:"selector-generator"},A={class:"contain"},H={class:"tool-header"},Y={class:"tool-body"},Z={class:"preview-panel"},q={class:"panel-header"},J={class:"panel-body"},K=["src"],Q={key:1,class:"empty-preview"},W={class:"result-panel"},ee={class:"panel-header"},te={class:"panel-body"},se={key:0,class:"selector-list"},le={class:"selector-header"},oe={class:"selector-type"},ne={class:"selector-value"},ae={key:0,class:"selector-score"},re={key:1,class:"empty-result"},ie=V({__name:"selector-generator",setup(ce){const h=m(!1),x=m(null),v=m(""),n=m(""),d=P({url:""}),u=m([]),C=async()=>{if(!d.url){p.message({message:"请输入URL",status:"warning"});return}try{new URL(d.url)}catch{p.message({message:"URL格式不正确",status:"error"});return}h.value=!0;try{const e=await(await fetch(`/api/crawler/tool/proxy?url=${encodeURIComponent(d.url)}`)).json();if(e.code===0){n.value&&URL.revokeObjectURL(n.value);const j=e.data.replace("</body>",`
        <script>
          (function() {
            const style = document.createElement('style');
            style.textContent = '.selector-highlight { outline: 2px solid #409eff !important; outline-offset: 2px; cursor: pointer; }';
            document.head.appendChild(style);
            
            document.addEventListener('mouseover', function(e) {
              e.target.classList.add('selector-highlight');
            });
            
            document.addEventListener('mouseout', function(e) {
              e.target.classList.remove('selector-highlight');
            });
            
            document.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              const element = e.target;
              const selectors = [];
              
              if (element.id) {
                selectors.push({
                  type: 'ID选择器',
                  value: '#' + element.id,
                  score: 95
                });
              }
              
              if (element.className && typeof element.className === 'string') {
                const classes = element.className.trim().split(/\\s+/).filter(c => c && !c.includes('selector-highlight'));
                if (classes.length > 0) {
                  selectors.push({
                    type: 'Class选择器',
                    value: '.' + classes.join('.'),
                    score: 85
                  });
                }
              }
              
              selectors.push({
                type: '标签选择器',
                value: element.tagName.toLowerCase(),
                score: 60
              });
              
              const path = [];
              let current = element;
              while (current && current.nodeType === Node.ELEMENT_NODE) {
                let selector = current.nodeName.toLowerCase();
                if (current.id) {
                  selector += '#' + current.id;
                  path.unshift(selector);
                  break;
                } else {
                  let nth = 1;
                  let sibling = current;
                  while (sibling.previousElementSibling) {
                    sibling = sibling.previousElementSibling;
                    if (sibling.nodeName === current.nodeName) nth++;
                  }
                  if (nth > 1) selector += ':nth-of-type(' + nth + ')';
                  path.unshift(selector);
                }
                current = current.parentElement;
                if (path.length > 5) break;
              }
              if (path.length > 0) {
                selectors.push({
                  type: 'CSS路径',
                  value: path.join(' > '),
                  score: 75
                });
              }
              
              function getXPath(el) {
                if (el.id) return '//*[@id="' + el.id + '"]';
                if (el === document.body) return '/html/body';
                let ix = 0;
                const siblings = el.parentNode?.childNodes || [];
                for (let i = 0; i < siblings.length; i++) {
                  const sibling = siblings[i];
                  if (sibling === el) {
                    return getXPath(el.parentNode) + '/' + el.tagName.toLowerCase() + '[' + (ix + 1) + ']';
                  }
                  if (sibling.nodeType === 1 && sibling.tagName === el.tagName) ix++;
                }
              }
              const xpath = getXPath(element);
              if (xpath) {
                selectors.push({
                  type: 'XPath',
                  value: xpath,
                  score: 70
                });
              }
              
              window.parent.postMessage({ type: 'SELECTOR_GENERATED', selectors: selectors }, '*');
            });
          })();
        <\/script>
      `+"</body>"),B=new Blob([j],{type:"text/html"}),w=URL.createObjectURL(B);n.value=w,v.value=w,u.value=[]}else p.message({message:e.msg||"加载页面失败",status:"error"})}catch(s){console.error("加载页面失败:",s),p.message({message:"加载页面失败，请检查URL是否正确",status:"error"})}finally{h.value=!1}},b=s=>{s.data.type==="SELECTOR_GENERATED"&&(u.value=s.data.selectors)},N=()=>{d.url="",n.value&&(URL.revokeObjectURL(n.value),n.value=""),v.value="",u.value=[]},R=s=>{navigator.clipboard.writeText(s).then(()=>{p.message({message:"已复制到剪贴板",status:"success"})})},U=()=>{const s=u.value.map(e=>`${e.type}: ${e.value}`).join(`
`);navigator.clipboard.writeText(s).then(()=>{p.message({message:"已复制全部选择器",status:"success"})})};return $(()=>{window.addEventListener("message",b)}),M(()=>{window.removeEventListener("message",b),n.value&&URL.revokeObjectURL(n.value)}),(s,e)=>(l(),r("div",z,[i(S,{items:["爬虫管理","工具","选择器生成器"]}),t("div",A,[t("div",H,[i(o(I),{model:d,inline:""},{default:c(()=>[i(o(E),{label:"目标URL"},{default:c(()=>[i(o(O),{modelValue:d.url,"onUpdate:modelValue":e[0]||(e[0]=a=>d.url=a),placeholder:"请输入网页URL",style:{width:"400px"}},null,8,["modelValue"])]),_:1}),i(o(E),null,{default:c(()=>[i(o(f),{type:"primary",onClick:C},{default:c(()=>[...e[1]||(e[1]=[g("加载页面",-1)])]),_:1}),i(o(f),{onClick:N},{default:c(()=>[...e[2]||(e[2]=[g("清空",-1)])]),_:1})]),_:1})]),_:1},8,["model"])]),t("div",Y,[t("div",Z,[t("div",q,[e[4]||(e[4]=t("h4",null,"页面预览",-1)),h.value?(l(),k(o(D),{key:0,type:"warning"},{default:c(()=>[...e[3]||(e[3]=[g("加载中...",-1)])]),_:1})):y("",!0)]),t("div",J,[v.value?(l(),r("iframe",{key:0,ref_key:"iframeRef",ref:x,src:v.value,class:"page-iframe",sandbox:"allow-same-origin allow-scripts"},null,8,K)):(l(),r("div",Q,[...e[5]||(e[5]=[t("div",{class:"empty-icon"},"🌐",-1),t("div",{class:"empty-text"},"请输入URL并加载页面",-1)])]))])]),t("div",W,[t("div",ee,[e[7]||(e[7]=t("h4",null,"生成的选择器",-1)),u.value.length>0?(l(),k(o(f),{key:0,size:"small",onClick:U},{default:c(()=>[...e[6]||(e[6]=[g(" 复制全部 ",-1)])]),_:1})):y("",!0)]),t("div",te,[u.value.length>0?(l(),r("div",se,[(l(!0),r(F,null,G(u.value,(a,L)=>(l(),r("div",{key:L,class:"selector-item"},[t("div",le,[t("span",oe,_(a.type),1),i(o(f),{size:"mini",onClick:T=>R(a.value)},{default:c(()=>[...e[8]||(e[8]=[g(" 复制 ",-1)])]),_:1},8,["onClick"])]),t("div",ne,_(a.value),1),a.score?(l(),r("div",ae," 评分: "+_(a.score)+"/100 ",1)):y("",!0)]))),128))])):(l(),r("div",re,[...e[9]||(e[9]=[t("div",{class:"empty-icon"},"🎯",-1),t("div",{class:"empty-text"},"点击页面元素生成选择器",-1),t("div",{class:"empty-tip"},"提示: 加载页面后，点击任意元素即可自动生成多个选择器",-1)])]))])])])])]))}}),ge=X(ie,[["__scopeId","data-v-ebe56750"]]);export{ge as default};
