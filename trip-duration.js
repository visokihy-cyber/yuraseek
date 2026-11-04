// Durations refer to the final road-route order, including start and finish legs.
export function routeTiming(route, stopCount){
 const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
 const legs=Array.isArray(route?.legs)&&route.legs.length===stopCount+1?route.legs.map(l=>valid(l.durationMillis)?l.durationMillis:null):[];
 const complete=legs.length===stopCount+1&&legs.every(valid);
 return {legs,total:complete?legs.reduce((a,b)=>a+b,0):valid(route?.durationMillis)?route.durationMillis:null};
}
export function approximateDuration(ms,en=false){
 if(typeof ms!=='number'||!Number.isFinite(ms)||ms<0)return en?'time unavailable':'время недоступно';
 if(ms<300000)return en?'under 5 min':'меньше 5 мин';
 const minutes=Math.round(ms/300000)*5,hours=Math.floor(minutes/60),rest=minutes%60;
 return '≈ '+[hours?hours+(en?' h':' ч'):'',rest?rest+(en?' min':' мин'):''].filter(Boolean).join(' ');
}
