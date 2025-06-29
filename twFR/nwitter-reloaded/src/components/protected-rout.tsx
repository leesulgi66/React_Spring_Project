import axios, { AxiosError } from "axios";
import axiosConfig from "../api/axios"
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({children} : {children:React.ReactNode}) {
    const navigate = useNavigate();
    const user = useSelector((state:any)=>state.user);
    const [isLoading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const loginCheck = async ()=> {
        try{
            const response = await axiosConfig.get("/api/user/check",{withCredentials : true})
            if(response.status === 200) {
                dispatch({type: "SET_USER", payload: response.data});
                setLoading(false);
                return children;
            }else{
                return null;
            }
            
        }catch(e) {
            if(e instanceof AxiosError){
                console.log(e.message);
                dispatch({type: "SET_USER", payload: null});
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