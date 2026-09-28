// Illustrative USD per million tokens, supplied in the course brief; check provider rate cards before budgeting.
export const MODELS={
 opus:{name:'Claude Opus 5.5',fresh:4,write:5,read:.2,output:20,write1h:8,color:'#76dded'},
 sol:{name:'GPT-6 Sol',fresh:2,write:2.5,read:.2,output:10,color:'#83b6ff'},
 astra:{name:'GPT-6 Astra',fresh:10,write:12.5,read:1,output:50,color:'#e4a2fa'},
 fable:{name:'Claude Fable 5.1',fresh:10,write:12.5,read:.25,output:50,write1h:20,color:'#f8c782'}
};
export function price(model,fresh=0,write=0,read=0,output=0,oneHour=false){
 const rate=MODELS[model];if(!rate)throw Error(`Unsupported model ${model}`);
 if([fresh,write,read,output].some(x=>!Number.isFinite(x)||x<0))throw Error('Token counts must be nonnegative');
 return (fresh*rate.fresh+write*(oneHour&&rate.write1h?rate.write1h:rate.write)+read*rate.read+output*rate.output)/1_000_000;
}
