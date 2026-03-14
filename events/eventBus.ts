type Listener = (payload?:any)=>void;

class EventBus{

events:Record<string,Listener[]> = {};

emit(event:string,data?:any){
(this.events[event]||[]).forEach(fn=>fn(data));
}

on(event:string,callback:Listener){
if(!this.events[event]) this.events[event]=[];
this.events[event].push(callback);
}

}

export const eventBus = new EventBus();