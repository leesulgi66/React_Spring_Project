import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({children} : {children:React.ReactNode}) {
    const navigate = useNavigate();
    const [user, setUser] = useState(window.sessionStorage.getItem("user"));
    const [isLoading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const loginCheck = async ()=> {
        if(!user) {
            navigate("/login");
        }
        try{
            const response = await axios.get("http://localhost:8080/api/user/check",{withCredentials : true})
            if(response.status === 200) {
                window.sessionStorage.setItem("user", response.data);
                setLoading(false);
                return children;
            }
        }catch(e) {
            if(e instanceof AxiosError){
                console.log(e.message);
                window.sessionStorage.removeItem("user");
                dispatch({type: "SET_LOGIN", payload: false});
                navigate("/login");
                return;
            }
        }
    }
    useEffect(()=>{loginCheck()}, []);

    if(!isLoading) {
        return children;
    }
}