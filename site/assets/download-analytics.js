(()=>{
  "use strict";

  const measurementId="G-ZNZ9KWS69F";
  const consentKey="thegymme-analytics-consent:v1";
  const panel=document.getElementById("privacy-panel");
  const acceptButton=document.getElementById("privacy-accept");
  const rejectButton=document.getElementById("privacy-reject");
  const settingsButton=document.getElementById("privacy-settings");
  let analyticsLoaded=false;

  const readConsent=()=>{try{return localStorage.getItem(consentKey)}catch{return null}};
  const writeConsent=value=>{try{localStorage.setItem(consentKey,value)}catch{}};
  const showPanel=()=>{panel.hidden=false;acceptButton.focus()};
  const hidePanel=()=>{panel.hidden=true};

  const loadAnalytics=()=>{
    if(analyticsLoaded)return;
    analyticsLoaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
    window.gtag("consent","default",{
      analytics_storage:"granted",
      ad_storage:"denied",
      ad_user_data:"denied",
      ad_personalization:"denied"
    });
    window.gtag("js",new Date());
    window.gtag("config",measurementId,{
      send_page_view:true,
      allow_google_signals:false,
      allow_ad_personalization_signals:false
    });
    const script=document.createElement("script");
    script.async=true;
    script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  };

  const setConsent=value=>{
    writeConsent(value);
    hidePanel();
    if(value==="granted")loadAnalytics();
    else if(typeof window.gtag==="function")window.gtag("consent","update",{analytics_storage:"denied"});
  };

  const trackCompletedDownload=({app,tag,filename,bytes})=>{
    if(readConsent()!=="granted"||typeof window.gtag!=="function")return false;
    window.gtag("event","apk_download_completed",{
      app_name:app,
      release_tag:tag,
      file_name:filename,
      download_size_bytes:bytes,
      transport_type:"beacon"
    });
    return true;
  };

  acceptButton.addEventListener("click",()=>setConsent("granted"));
  rejectButton.addEventListener("click",()=>setConsent("denied"));
  settingsButton.addEventListener("click",showPanel);
  panel.addEventListener("keydown",event=>{if(event.key==="Escape")hidePanel()});

  const consent=readConsent();
  if(consent==="granted")loadAnalytics();
  else if(consent!=="denied")showPanel();

  window.TheGymmeAnalytics={trackCompletedDownload,openPreferences:showPanel};
})();
