import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 1px;
`;

const TextArea = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    &::placeholder {
        font-size: 16px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const AttachFileButton = styled.label`
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,
    &:active {
        opacity: 0.8;
    }
`;

export default function PostTweetForm({ onTweetPosted }: { onTweetPosted: () => void }) {
    const [isLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    const [file, setFile] = useState<File|null>(null);
    const [user, setUser] = useState(window.sessionStorage.getItem("user"));
    const csrfToken = useSelector((state:any)=>state.csrfToken);
    const navigate = useNavigate();

    const onChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value);
    }
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>)=> {
        const{files} = e.target;
        if(files && files.length === 1) {
            if(files[0].size < 1*1024*1024){
                setFile(files[0]);
                console.log("file on");
            }else {
                alert("image file size should be less than 1Mb");
            }
        }
    }
    const onSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(isLoading || tweet === "" || tweet.length > 180) return;
        try{
            setLoading(true);
            if(user === null) return
            const formData = new FormData();
            formData.append("user", user);
            formData.append("tweet", tweet);
            if(file !== null){
                formData.append("file", file);
            }
            const response = await axios.post("http://localhost:8080/api/board",formData, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                withCredentials : true,
            });

            if(response.status == 200) {
                console.log(response)
                setLoading(false);
                onTweetPosted();
            }
            setTweet("");
            setFile(null);
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("Please Log in");
                navigate("/login");
            }
            
        }finally {
            setLoading(false);
            setFile(null);
        }
    }
    return (
    <Form onSubmit={onSubmit}>
        <TextArea required rows={5} maxLength={180} onChange={onChange} value={tweet} placeholder="What is happening?"/>
        <AttachFileButton htmlFor="file">{file ? "Photo added ✅" : "Add photo"}</AttachFileButton>
        <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*" />
        <SubmitBtn type="submit" value={isLoading ? "Posting..." : "Post Tweet"}/>
    </Form>
    )
}