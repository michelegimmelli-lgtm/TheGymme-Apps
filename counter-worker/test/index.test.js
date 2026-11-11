import test from"node:test";
import assert from"node:assert/strict";
import worker,{parseDownload}from"../src/index.js";

const valid={
  app:"interval",
  tag:"interval-standalone-no-lk-apk-v4.1.2-1011-30d",
  filename:"TheGymme-Interval.apk",
  bytes:6270000
};

test("accepts a valid aggregate download",()=>{
  assert.deepEqual(parseDownload(valid),valid);
});

test("rejects unknown apps and mismatched tags",()=>{
  assert.equal(parseDownload({...valid,app:"other"}),null);
  assert.equal(parseDownload({...valid,tag:"calculator-apk-v1"}),null);
});

test("rejects invalid files and byte counts",()=>{
  assert.equal(parseDownload({...valid,filename:"payload.exe"}),null);
  assert.equal(parseDownload({...valid,bytes:12}),null);
});

test("does not write when the origin is not allowed",async()=>{
  let wrote=false;
  const env={
    ALLOWED_ORIGINS:"https://michelegimmelli-lgtm.github.io",
    DB:{prepare(){wrote=true;throw new Error("should not write")}}
  };
  const request=new Request("https://counter.example/v1/download-completed",{
    method:"POST",
    headers:{Origin:"https://attacker.example","Content-Type":"application/json"},
    body:JSON.stringify(valid)
  });
  const response=await worker.fetch(request,env);
  assert.equal(response.status,403);
  assert.equal(wrote,false);
});

test("writes only the aggregate fields for an allowed download",async()=>{
  let bindingValues=[];
  const env={
    ALLOWED_ORIGINS:"https://michelegimmelli-lgtm.github.io",
    DB:{prepare(){return{bind(...values){bindingValues=values;return{run:async()=>({success:true})}}}}}
  };
  const request=new Request("https://counter.example/v1/download-completed",{
    method:"POST",
    headers:{Origin:"https://michelegimmelli-lgtm.github.io","Content-Type":"application/json"},
    body:JSON.stringify({...valid,ignoredUserAgent:"private"})
  });
  const response=await worker.fetch(request,env);
  assert.equal(response.status,202);
  assert.deepEqual(bindingValues.slice(1),[valid.app,valid.tag,valid.filename,valid.bytes]);
  assert.equal(bindingValues.includes("private"),false);
});
