/* Presentation-only TeX compatibility; canonical source text remains unchanged. */
(function(root){
  const delimiters=[{left:'$$',right:'$$',display:false},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:false}];
  function normalize(text){
    return text.replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&')
      .replace(/\\\\%/g,'\\%')
      .replace(/\\texttt\{\\textbf\{([^{}]*)\}\}/g,'\\textbf{$1}')
      .replace(/\\textsc\{/g,'\\mathrm{')
      .replace(/\\textemdash\b/g,'\\text{—}')
      .replace(/\\textless\b/g,'<')
      .replace(/\\(AC|TC|NC)\b/g,'\\mathrm{$1}');
  }
  function prepare(text){
    return text.replace(/\$18\.31\\\$%/g,'$18.31\\%$');
  }
  function render(el){
    if(!root.renderMathInElement)return;
    root.renderMathInElement(el,{delimiters,preProcess:normalize,trust:false,strict:'ignore',throwOnError:false,macros:{},errorColor:'#805000'});
  }
  root.ICMLMath={normalize,prepare,render,delimiters};
  if(typeof module!=='undefined')module.exports=root.ICMLMath;
})(typeof window==='undefined'?globalThis:window);
