import {price} from './economics.js';
export const PREFIX_BLOCKS=[
 {id:'tools',label:'TOOLS',tokens:1200},
 {id:'system',label:'SYSTEM',tokens:1600},
 {id:'history',label:'STABLE HISTORY',tokens:1200},
 {id:'user',label:'NEW USER TURN',tokens:200}
];
export function prefixExperiment({changed='system',model='opus',output=300}={}){
 if(!['none',...PREFIX_BLOCKS.map(b=>b.id)].includes(changed))throw Error('Unknown changed block');
 const prefix=PREFIX_BLOCKS.slice(0,-1).reduce((sum,b)=>sum+b.tokens,0),fresh=PREFIX_BLOCKS.at(-1).tokens;
 const hit=changed==='none'||changed==='user',write=hit?0:prefix,read=hit?prefix:0;
 return {hit,missAt:hit?null:changed,prefix,fresh,write,read,output,
  firstCost:price(model,fresh,prefix,0,output),secondCost:price(model,fresh,write,read,output)};
}
export function ttlExperiment({gap=8,ttl=5,breakAt=0,calls=10,model='opus'}={}){
 if(![5,60].includes(ttl)||!Number.isFinite(gap)||gap<0||!Number.isInteger(calls)||calls<2||calls>20)throw Error('Invalid timeline settings');
 let minute=0,cacheUntil=-1;
 const rows=Array.from({length:calls},(_,index)=>{
  const turn=index+1;if(index)minute+=gap;
  const changed=turn===Number(breakAt);if(changed)cacheUntil=-1;
  const hit=minute<cacheUntil,read=hit?4000:0,write=hit?0:4000;
  const cost=price(model,200,write,read,300,ttl===60);
  cacheUntil=minute+ttl;
  return {turn,minute,hit,changed,read,write,cost};
 });
 return {rows,hits:rows.filter(r=>r.hit).length,writes:rows.filter(r=>!r.hit).length,total:rows.reduce((sum,r)=>sum+r.cost,0)};
}
export function agentExperiment({model='astra',turns=20,prefix=80000,fresh=2000,output=3000,effort='medium',cache=true}={}){
 if(!Number.isInteger(turns)||turns<1||turns>200||!Number.isFinite(prefix)||prefix<0||!Number.isFinite(fresh)||fresh<0||!Number.isFinite(output)||output<0)throw Error('Invalid agent workload');
 const factor={low:.6,medium:1,high:1.6}[effort];if(!factor)throw Error('Invalid effort');
 const writeTokens=cache?prefix:0,readTokens=cache?(turns-1)*prefix:0,freshTokens=turns*(fresh+(cache?0:prefix)),outputTokens=turns*Math.round(output*factor);
 const freshCost=price(model,freshTokens),writeCost=price(model,0,writeTokens),readCost=price(model,0,0,readTokens),outputCost=price(model,0,0,0,outputTokens);
 return {model,turns,prefix,cache,effort,writeTokens,readTokens,freshTokens,outputTokens,freshCost,writeCost,readCost,outputCost,
  total:freshCost+writeCost+readCost+outputCost,success:cache&&turns>=20&&prefix>=80000&&readCost<.5};
}
