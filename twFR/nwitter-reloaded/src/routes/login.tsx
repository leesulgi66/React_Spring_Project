import { useEffect, useState } from "react";
import styled from "styled-components"
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import axiosConfig from "../api/axios"
import { useDispatch, useSelector } from "react-redux";
import CsrfToken from "../api/csrfTokenGet";
import KakaoButton from "../components/kakao-btn";
import GoogleButton from "../components/google-btn";

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

export default function LoginForm() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();

    const onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const {target: { name, value }} = e;
        if (name === "email") {
            setEmail(value);
        }else if (name === "password") {
            setPassword(value);
        }
    }

    const fetchWithRetry = async (
        config: any, 
        retries: number = 2, 
        delay: number = 500
    ) => {
        try {
            const response = await axiosConfig(config);
            return response;
        } catch (error) {
            if (retries > 0) {
                CsrfToken().then(token => {
                    getToken(token);
                });
                await new Promise(res => setTimeout(res, delay));
                return fetchWithRetry(config, retries - 1, delay);
            } else {
                throw error;
            }
        }
    };

    const onSubmit =async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(isLoading || email === "" || password === "") return;
        try{
            setLoading(true);
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const response = await fetchWithRetry({
                url: "/loginApi",
                method: 'POST',
                data: formData,
            }, 2, 500);

            if(response.status === 201) {
                //console.log("로그인 data : ",response.data); // user id
                dispatch({type: "SET_USER", payload: response.data});
                const csrfToken = response.headers['x-csrf-token']; // 로그인 후 재발급
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
                if(e.status === 403 || e.status === 401) { 
                    CsrfToken().then(token => {
                        getToken(token);
                    });
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

    return (
        <Wrapper>
            <Title onClick={onFocus}>Log into X</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="text" required/>
                <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" autoComplete="off" required/>
                <Input type="submit" value={isLoading ? "Loading..." : "Log in"}/>
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                    Don't have an account? <Link to="/create-account">Create one &rarr;</Link>
            </Switcher>
            <GoogleButton />
            <KakaoButton />
        </Wrapper>
    )
}