import {test} from 'node:test';
import assert from 'node:assert/strict';
import {transformSync} from 'esbuild';
import {readFileSync} from 'node:fs';
const code=transformSync(readFileSync('src/lib/experienceScroll.ts','utf8'),{loader:'ts',format:'esm'}).code;
const {experienceScrollIndex:index}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('scroll crosses all four chapters in order and reverses',()=>{assert.deepEqual([0,-400,-800,-1200,-1600,-1200,-800,-400,0].map(top=>index(top,2400,800,4)),[0,1,2,3,3,3,2,1,0]);});
test('overscroll never escapes catalogue bounds',()=>{assert.equal(index(1000,2400,800,4),0);assert.equal(index(-10000,2400,800,4),3);});
test('empty, single-item, nonfinite and short layouts remain safe',()=>{assert.equal(index(-10,0,800,0),0);assert.equal(index(-10,0,800,1),0);assert.equal(index(NaN,2400,800,4),0);assert.equal(index(-2,500,800,4),3);});
