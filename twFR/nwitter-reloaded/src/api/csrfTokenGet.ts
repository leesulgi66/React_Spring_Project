import axios, { AxiosError } from "axios";

export default function CsrfToken() {
    const getToken = async()=>{
        const baseURL = import.meta.env.VITE_SERVER_URL;
        try{
            const response = await axios.get(baseURL+"/api/csrf-token", { withCredentials: true })
            if(response.status == 200) {
                return(response.data.token);
            }
        }
        catch(e){
            if(e instanceof AxiosError){
                console.log(e);
            }
        }
    }
    return getToken();
}