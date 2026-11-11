(()=>{
  "use strict";

  const endpoint=String(window.TheGymmeConfig?.downloadCounterEndpoint||"").replace(/\/$/,"");

  const recordCompletedDownload=async({app,tag,filename,bytes})=>{
    if(!endpoint)return false;

    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),2500);
    try{
      const response=await fetch(`${endpoint}/v1/download-completed`,{
        method:"POST",
        mode:"cors",
        credentials:"omit",
        cache:"no-store",
        keepalive:true,
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({app,tag,filename,bytes}),
        signal:controller.signal
      });
      return response.ok;
    }catch{
      return false;
    }finally{
      window.clearTimeout(timeout);
    }
  };

  window.TheGymmeDownloads={recordCompletedDownload};
})();
