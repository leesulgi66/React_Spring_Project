import { useEffect, useState } from "react";
import styled from "styled-components"
import { Link, useNavigate } from "react-router-dom";
import GithubButton from "../components/github-btn";
import axios, { AxiosError } from "axios";
import { useDispatch, useSelector } from "react-redux";
import CsrfToken from "../components/csrfTokenGet";

const Wrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 420px;
    padding: 50px 0px;
`;

const Title = styled.h1`
    font-size: 42px;
    cursor: pointer;
`;

const Form = styled.form`
    margin-top: 50px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const Input = styled.input`
    padding: 10px 20px;
    border-radius: 50px;
    border: none;
    width: 100%;
    font-size: 16px;
    &[type="submit"]{
        cursor: pointer;
        &:hover {
            opacity: 0.8;
        }
    }
    &.log-in{
        background-color: dodgerblue;
    }
`;

const Error = styled.span`
    color: red;
`;

const Switcher = styled.span`
    margin-top: 20px;
    a{
        color: #1d9bf0;
    }
`;

export default function CreateAccount() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const csrfToken = useSelector((state:any)=>state.csrfToken);
    const loginState = useSelector((state:any) => state.login);
    const dispatch = useDispatch();

    const onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const {target: { name, value }} = e;
        if (name === "email") {
            setEmail(value);
        }else if (name === "password") {
            setPassword(value);
        }
    }
    const onSubmit =async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(isLoading || email === "" || password === "") return;
        try{
            setLoading(true);
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const response = await axios({
                url: "http://localhost:8080/loginApi",
                method: 'POST',
                data: formData,
                withCredentials: true,
                headers:{
                    'X-CSRF-TOKEN': csrfToken
                }
            });

            if(response.status === 201) {
                //console.log("로그인 data : ",response.data); // user id
                window.sessionStorage.setItem("user", response.data);
                dispatch({type: "SET_LOGIN", payload: true});
                const csrfToken = response.headers['x-csrf-token']; 
                dispatch({type: "SET_STRING", payload : csrfToken});
                alert("로그인 성공");
                setError("");
                setLoading(false);
                navigate("/");
            }

            if(response.status === 200) {
                setError(response?.data);
            }
            
        }catch(e) {
            if(e instanceof AxiosError){
                console.log("error : ", e);
                console.log("e status : ", e.status);
                setError(e.name);
                if(e.status === 401) {
                    if(e.message === "Request failed with status code 401"){
                        CsrfToken().then(token => {
                            getToken(token);
                        });
                    }
                }
            }
        }finally {
            setLoading(false);
        }
    }

    const getToken = async(token:string)=>{
        dispatch({type: "SET_STRING", payload : token});
    }

    const onFocus = ()=>{
        navigate('/');
    }

    useEffect(()=>{
        CsrfToken().then(token => {
            getToken(token);
        });
    },[]);

    return (
        <Wrapper>
            <Title onClick={onFocus}>Log into X</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="text" required/>
                <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>
                <Input type="submit" value={isLoading ? "Loading..." : "Log in"}/>
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                    Don't have an account? <Link to="/create-account">Create one &rarr;</Link>
            </Switcher>
            <GithubButton />
        </Wrapper>
    )
}