type Listener = (payload?:any)=>void;

// EventBus class manages custom events across the app
class EventBus{

// Store all events and their corresponding listeners
events:Record<string,Listener[]> = {};

// Emit an event: triggers all listeners registered for this event
emit(event:string,data?:any){
      // Get listeners for the event (or empty array if none) and call each with the payload
(this.events[event]||[]).forEach(fn=>fn(data));
}

// Register a listener function for a specific event
  on(event: string, callback: Listener) {
    // If this event does not exist yet, create an empty array
    if (!this.events[event]) this.events[event] = [];
    // Add the callback to the list of listeners for this event
    this.events[event].push(callback);
  }
}

// Create a singleton EventBus instance that can be imported and used anywhere
export const eventBus = new EventBus();