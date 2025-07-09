import { useState } from "react";
import styled from "styled-components"
import { Link, useNavigate } from "react-router-dom";
import KakaoButton from "../components/kakao-btn";
import { AxiosError } from "axios";
import axiosConfig from "../api/axios"
import { useDispatch } from "react-redux";
import CsrfToken from "../api/csrfTokenGet";
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

export default function CreateAccount() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [username, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();

    const onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const {target: { name, value }} = e;
        if (name === "username") {
            setName(value);
        }else if (name === "email") {
            setEmail(value);
        }else if (name === "password") {
            setPassword(value);
        }else if (name === "passwordCheck"){
            setPasswordCheck(value);
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
                    dispatch({type: "SET_STRING", payload : token});
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
        setError("");
        if(isLoading || username === "" || email === "" || password === "") return;
        if(password !== passwordCheck) {
            setError("Passwords do not match");
            return
        }
        if(!/\S+@\S+\.\S+/.test(email)) {
            setError("올바른 이메일 형식이 아닙니다.");
            return;
        }
        try{
            const response = await fetchWithRetry({
                url: "/api/user/signUp",
                method: 'POST',
                data: {
                    username,
                    password,
                    email               
                },
            }, 2, 300);
            console.log(response);

            if(response.status == 200) {
                alert("회원가입 완료");
                navigate("/login");
            }
            
        }catch(e) {
            if(e instanceof AxiosError){
                console.log(e.response);
                if(e.response?.status === 500)
                setError(e.response?.data || "회원가입에 실패했습니다. 잠시후 시도해 주세요.");
            }
        }finally {
            setLoading(false);
        }
    }

    const onClick = ()=>{
        navigate('/login');
    }
    return (
        <Wrapper>
            <Title onClick={onClick}>Join MEMO</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="username" value={username} placeholder="Name" type="text" required/>
                <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>
                <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>
                <Input onChange={onChange} name="passwordCheck" value={passwordCheck} placeholder="Password check" type="password" required/>
                <Input type="submit" value={isLoading ? "Loading..." : "Create Account"}/>
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Already have an account? <Link to="/login">Log in &rarr;</Link>
            </Switcher>
            <GoogleButton />
            <KakaoButton />
        </Wrapper>
    )
}