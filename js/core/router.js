import { getState, setState } from "./state.js";

const history = [];
let bridge = null;

export function setNavigationBridge(fn){ bridge = typeof fn === "function" ? fn : null; }

export function current(){ return getState().screen; }

export function navigate(screen, params = {}){
  const currentScreen = getState().screen;
  if(currentScreen !== screen) history.push({screen:currentScreen, params:{}});
  setState({screen, ...params});
  if(bridge) bridge(screen, params);
}

export function back(){
  const previous = history.pop();
  if(!previous){
    if(bridge) bridge("home", {});
    return;
  }
  setState({screen:previous.screen, ...previous.params});
  if(bridge) bridge(previous.screen, previous.params);
}

export function clearHistory(){ history.length = 0; }
