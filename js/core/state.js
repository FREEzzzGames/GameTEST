const DEFAULT_STATE = Object.freeze({
  screen: "home",
  categoryId: null,
  gameId: null,
  chat: { mode: "rooms", room: "main", userId: null },
  modal: null,
  language: "ru",
  radio: { open: false, playing: false }
});

let state = structuredClone(DEFAULT_STATE);
const listeners = new Set();

export function getState(){ return state; }
export function setState(patch){
  state = {
    ...state,
    ...patch,
    chat: patch.chat ? {...state.chat,...patch.chat} : state.chat,
    radio: patch.radio ? {...state.radio,...patch.radio} : state.radio
  };
  listeners.forEach(fn => fn(state));
  return state;
}
export function subscribe(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
export function resetState(){ state = structuredClone(DEFAULT_STATE); listeners.forEach(fn=>fn(state)); }
