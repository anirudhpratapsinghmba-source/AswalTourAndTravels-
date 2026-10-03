// ASWAL TOUR & TRAVELS — Google Places (New) + Routes API secure proxy
// Deploy with: supabase functions deploy google-maps-proxy
// Secrets: GOOGLE_MAPS_API_KEY, ASWAL_ALLOWED_ORIGIN
const allowedOrigin=Deno.env.get("ASWAL_ALLOWED_ORIGIN")||"https://anirudhpratapsinghmba-source.github.io";
const cors={"Access-Control-Allow-Origin":allowedOrigin,"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
const apiKey=Deno.env.get("GOOGLE_MAPS_API_KEY");
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"POST required"},405);
 if(!apiKey)return json({error:"Server is not configured with GOOGLE_MAPS_API_KEY."},503);
 try{
  const body=await req.json(),action=body?.action;
  if(action==="autocomplete"){
   const input=String(body?.input||"").trim();
   if(input.length<2)return json({suggestions:[]});
   const response=await fetch("https://places.googleapis.com/v1/places:autocomplete",{method:"POST",headers:{"Content-Type":"application/json","X-Goog-Api-Key":apiKey,"X-Goog-FieldMask":"suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text,suggestions.placePrediction.types"},body:JSON.stringify({input,includedRegionCodes:["in"],sessionToken:String(body?.sessionToken||crypto.randomUUID())})});
   const data=await response.json();if(!response.ok)return json({error:data?.error?.message||"Places autocomplete failed."},response.status);return json({suggestions:data.suggestions||[]});
  }
  if(action==="details"){
   const placeId=String(body?.placeId||"").trim();if(!placeId)return json({error:"placeId is required."},400);
   const response=await fetch("https://places.googleapis.com/v1/places/"+encodeURIComponent(placeId),{headers:{"X-Goog-Api-Key":apiKey,"X-Goog-FieldMask":"id,displayName,formattedAddress,location,types"}});
   const data=await response.json();if(!response.ok)return json({error:data?.error?.message||"Place details failed."},response.status);
   return json({placeId:data.id,displayName:data.displayName?.text||"",formattedAddress:data.formattedAddress||"",primaryText:data.displayName?.text||"",secondaryText:data.formattedAddress||"",lat:data.location?.latitude??null,lng:data.location?.longitude??null,types:data.types||[]});
  }
  if(action==="route"){
   const origin=body?.origin,destination=body?.destination;if(!origin||!destination)return json({error:"origin and destination are required."},400);
   const location=p=>p?.lat!=null&&p?.lng!=null?{location:{latLng:{latitude:Number(p.lat),longitude:Number(p.lng)}}}:p?.placeId?{placeId:p.placeId}:null;
   const response=await fetch("https://routes.googleapis.com/directions/v2:computeRoutes",{method:"POST",headers:{"Content-Type":"application/json","X-Goog-Api-Key":apiKey,"X-Goog-FieldMask":"routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline"},body:JSON.stringify({origin:location(origin),destination:location(destination),travelMode:"DRIVE",routingPreference:"TRAFFIC_AWARE",computeAlternativeRoutes:false,languageCode:"en-IN",units:"METRIC"})});
   const data=await response.json();if(!response.ok)return json({error:data?.error?.message||"Route calculation failed."},response.status);
   const route=data?.routes?.[0];if(!route)return json({error:"No driving route was found."},422);
   return json({distanceKm:Math.round(Number(route.distanceMeters||0)/100)/10,durationSeconds:Number.parseInt(String(route.duration||"0s").replace("s",""),10)||null,encodedPolyline:route.polyline?.encodedPolyline||"",source:"google-routes"});
  }
  return json({error:"Unknown action."},400);
 }catch(error){return json({error:error instanceof Error?error.message:"Unexpected server error."},500);}
});