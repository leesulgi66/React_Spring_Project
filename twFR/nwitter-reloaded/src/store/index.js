
import { legacy_createStore as createStore } from "redux"

function reducer(currentState, action) {
    if(currentState === undefined) {
        return {
            csrfToken: "null",
            login: false,
        }
    }
    const newState = {...currentState};
    ///////////////////////////////////
    if(action.type === "SET_STRING") {
        return {
            ...newState,
            csrfToken: action.payload
        };
    }
    if(action.type === "SET_LOGIN") {
        return {
            ...newState,
            login: action.payload
        }
    }

    return newState;
}

const store = createStore(reducer);

export default store;