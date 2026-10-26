// Staff data uses authenticated same-origin server routes, never anonymous database CRUD.
export function portalFetch(url, options = {}) {
  return fetch(url, { ...options, credentials:'same-origin', headers:{'Content-Type':'application/json',...options.headers} });
}
function query(table) {
  const spec={table,operation:'select',columns:'*',filters:[],orders:[]};
  const builder={
    select(columns='*',options={}){spec.columns=columns;Object.assign(spec,options);return builder;},
    eq(column,value){spec.filters.push({op:'eq',column,value});return builder;},
    neq(column,value){spec.filters.push({op:'neq',column,value});return builder;},
    order(column,options={}){spec.orders.push({column,...options});return builder;},
    limit(value){spec.limit=value;return builder;},
    insert(payload){spec.operation='insert';spec.payload=payload;return builder;},
    update(payload){spec.operation='update';spec.payload=payload;return builder;},
    delete(){spec.operation='delete';return builder;},
    single(){spec.single='single';return builder;},
    maybeSingle(){spec.single='maybeSingle';return builder;},
    then(resolve,reject){return execute().then(resolve,reject);},
  };
  async function execute(){
    try{
      const res=await portalFetch('/api/operations',{method:'POST',body:JSON.stringify(spec)});
      const body=await res.json();
      if(!res.ok)return {data:null,count:null,error:{message:body.error||'Staff data unavailable.'}};
      return body;
    }catch{return {data:null,count:null,error:{message:'Staff data unavailable. Check your connection and retry.'}};}
  }
  return builder;
}
export const supabase={from:query};
