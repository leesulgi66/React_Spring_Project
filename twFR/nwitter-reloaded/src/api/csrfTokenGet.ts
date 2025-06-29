import axios, { AxiosError } from "axios";

export default function CsrfToken() {
    const getToken = async()=>{
        try{
            const response = await axios.get("http://localhost:8080/api/csrf-token", { withCredentials: true })
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