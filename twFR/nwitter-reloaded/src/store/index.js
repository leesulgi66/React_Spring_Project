
import { legacy_createStore as createStore } from "redux"

function reducer(currentState, action) {
    if(currentState === undefined) {
        return {
            csrfToken: "null",
            test: 1,
        }
    }
    const newState = {...currentState};

    if (action.type === "SET_STRING") {
        return {
            ...newState,
            csrfToken: action.payload
        };
    }

    return newState;
}

const store = createStore(reducer);

export default store;