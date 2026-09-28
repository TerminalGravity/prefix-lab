import test from 'node:test';
import assert from 'node:assert/strict';
import {prefixExperiment,ttlExperiment,agentExperiment} from '../src/cache-lab.js';
import {price} from '../src/economics.js';

test('changing only the new user turn preserves the cached 4K prefix',()=>{
 const result=prefixExperiment({changed:'user',model:'opus'});
 assert.equal(result.hit,true);
 assert.equal(result.read,4000);
 assert.equal(result.write,0);
 assert.equal(result.fresh,200);
 assert.equal(result.secondCost,price('opus',200,0,4000,300));
});

test('changing an early tools block forces a fresh write at the breakpoint',()=>{
 const result=prefixExperiment({changed:'tools',model:'opus'});
 assert.equal(result.hit,false);
 assert.equal(result.missAt,'tools');
 assert.equal(result.read,0);
 assert.equal(result.write,4000);
 assert.ok(result.secondCost>prefixExperiment({changed:'user',model:'opus'}).secondCost);
});

test('8-minute gaps rewrite a 5-minute cache but reuse a 1-hour cache',()=>{
 const short=ttlExperiment({gap:8,ttl:5}),long=ttlExperiment({gap:8,ttl:60});
 assert.equal(short.rows.filter(r=>r.hit).length,0);
 assert.equal(long.rows.filter(r=>r.hit).length,9);
 assert.equal(short.rows[1].write,4000);
 assert.equal(long.rows[1].read,4000);
 assert.ok(long.total<short.total);
});

test('a changed system block invalidates even a warm one-hour cache',()=>{
 const result=ttlExperiment({gap:8,ttl:60,breakAt:6});
 assert.equal(result.rows[5].hit,false);
 assert.equal(result.rows[5].changed,true);
 assert.equal(result.rows[6].hit,true);
});

test('agent bills a prefix write once and reads it on later turns',()=>{
 const r=agentExperiment({model:'opus',turns:20,prefix:80000});
 assert.equal(r.writeTokens,80000);
 assert.equal(r.readTokens,19*80000);
 assert.equal(r.freshTokens,20*2000);
 assert.equal(r.outputTokens,20*3000);
 assert.equal(r.total,r.freshCost+r.writeCost+r.readCost+r.outputCost);
 assert.ok(r.success);
});

test('uncached agent spends more on identical turns and output',()=>{
 const cached=agentExperiment({model:'opus',turns:20,cache:true});
 const uncached=agentExperiment({model:'opus',turns:20,cache:false});
 assert.ok(uncached.total>cached.total);
 assert.equal(uncached.readTokens,0);
 assert.equal(uncached.freshTokens,20*(80000+2000));
});

test('Astra and Fable share list rates but differ on cache reads',()=>{
 const astra=agentExperiment({model:'astra'}),fable=agentExperiment({model:'fable'});
 assert.equal(astra.freshCost,fable.freshCost);
 assert.equal(astra.outputCost,fable.outputCost);
 assert.ok(astra.readCost>fable.readCost);
 assert.ok(!astra.success);
});

test('higher illustrative effort changes billed output but not cached input',()=>{
 const low=agentExperiment({model:'sol',effort:'low'}),high=agentExperiment({model:'sol',effort:'high'});
 assert.equal(low.readTokens,high.readTokens);
 assert.ok(high.outputTokens>low.outputTokens);
 assert.ok(high.total>low.total);
});
