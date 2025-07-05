
import { legacy_createStore as createStore } from "redux"

function reducer(currentState:any, action:any) {
    if(currentState === undefined) {
        return {
            csrfToken: null,
            user: null,
            replyEdit: null,
            boardEdit: null,
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
    if(action.type === "SET_USER") {
        return {
            ...newState,
            user: action.payload
        };
    };
    if(action.type === "REPLY_EDIT"){
        if(action.payload === currentState.replyEdit){
            return{
                ...newState,
                replyEdit : null
            }
        }else if(action.payload === null){
            return{
                ...newState,
                replyEdit : null
            }
        }else{
            return{
                ...newState,
                replyEdit : action.payload
            };
        }
    };
    if(action.type === "BOARD_EDIT"){
        if(action.payload === currentState.boardEdit){
            return{
                ...newState,
                boardEdit : null
            }
        }else if(action.payload === null){
            return{
                ...newState,
                boardEdit : null
            }
        }else{
            return{
                ...newState,
                boardEdit : action.payload
            };
        }
    };

    return newState;
}

const store = createStore(reducer);

export default store;