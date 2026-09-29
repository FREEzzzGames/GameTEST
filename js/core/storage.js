const PREFIX="freezzz:";

export const Storage = {
  get(key, fallback=null){
    try{
      const value=localStorage.getItem(PREFIX+key);
      return value===null ? fallback : JSON.parse(value);
    }catch(e){ return fallback; }
  },
  set(key,value){
    try{ localStorage.setItem(PREFIX+key,JSON.stringify(value)); }catch(e){}
  },
  remove(key){
    try{ localStorage.removeItem(PREFIX+key); }catch(e){}
  }
};
