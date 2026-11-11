const APPS=new Set(["calculator","ramping","interval"]);
const JSON_HEADERS={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};

const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{
  status,
  headers:{...JSON_HEADERS,...headers}
});

const allowedOrigins=env=>new Set(String(env.ALLOWED_ORIGINS||"")
  .split(",")
  .map(value=>value.trim())
  .filter(Boolean));

const corsHeaders=(origin,env)=>allowedOrigins(env).has(origin)?{
  "Access-Control-Allow-Origin":origin,
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Access-Control-Allow-Headers":"Content-Type",
  "Access-Control-Max-Age":"86400",
  "Vary":"Origin"
}:{};

const validText=(value,max)=>typeof value==="string"&&value.length>0&&value.length<=max;

const parseDownload=payload=>{
  if(!payload||typeof payload!=="object")return null;
  const app=String(payload.app||"").toLowerCase();
  const tag=String(payload.tag||"");
  const filename=String(payload.filename||"");
  const bytes=Number(payload.bytes);
  if(!APPS.has(app))return null;
  if(!validText(tag,160)||!tag.toLowerCase().startsWith(`${app}-`))return null;
  if(!validText(filename,180)||!filename.toLowerCase().endsWith(".apk"))return null;
  if(!Number.isSafeInteger(bytes)||bytes<100000||bytes>300000000)return null;
  return{app,tag,filename,bytes};
};

const unauthorized=()=>json({ok:false,error:"unauthorized"},401,{"WWW-Authenticate":"Bearer"});

export default{
  async fetch(request,env){
    const url=new URL(request.url);
    const origin=request.headers.get("Origin")||"";

    if(request.method==="GET"&&url.pathname==="/health")return json({ok:true});

    if(request.method==="OPTIONS"&&url.pathname==="/v1/download-completed"){
      if(!allowedOrigins(env).has(origin))return new Response(null,{status:403});
      return new Response(null,{status:204,headers:corsHeaders(origin,env)});
    }

    if(request.method==="POST"&&url.pathname==="/v1/download-completed"){
      const cors=corsHeaders(origin,env);
      if(!cors["Access-Control-Allow-Origin"])return json({ok:false,error:"origin_not_allowed"},403);
      if(Number(request.headers.get("Content-Length")||0)>2048)return json({ok:false,error:"payload_too_large"},413,cors);

      let payload;
      try{payload=parseDownload(await request.json())}catch{return json({ok:false,error:"invalid_json"},400,cors)}
      if(!payload)return json({ok:false,error:"invalid_download"},400,cors);

      const day=new Date().toISOString().slice(0,10);
      await env.DB.prepare(`
        INSERT INTO download_totals (day, app, release_tag, file_name, download_count, bytes_total, last_received_at)
        VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(day, app, release_tag) DO UPDATE SET
          file_name = excluded.file_name,
          download_count = download_totals.download_count + 1,
          bytes_total = download_totals.bytes_total + excluded.bytes_total,
          last_received_at = CURRENT_TIMESTAMP
      `).bind(day,payload.app,payload.tag,payload.filename,payload.bytes).run();

      return json({ok:true},202,cors);
    }

    if(request.method==="GET"&&url.pathname==="/v1/totals"){
      const authorization=request.headers.get("Authorization")||"";
      if(!env.ADMIN_TOKEN||authorization!==`Bearer ${env.ADMIN_TOKEN}`)return unauthorized();
      const result=await env.DB.prepare(`
        SELECT day, app, release_tag, file_name, download_count, bytes_total, last_received_at
        FROM download_totals
        ORDER BY day DESC, app ASC, release_tag ASC
        LIMIT 1000
      `).all();
      return json({ok:true,rows:result.results||[]});
    }

    return json({ok:false,error:"not_found"},404);
  }
};

export{parseDownload};
