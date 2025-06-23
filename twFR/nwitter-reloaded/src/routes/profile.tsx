import styled from "styled-components";
import { useEffect, useState } from "react";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CsrfToken from "../components/csrfTokenGet";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 15px;
`;

const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9cf038;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg{
        width: 50px;
    }
`;

const AvatarImg = styled.img`
    width: 100%;
`;

const AvatarInput = styled.input`
    display: none;
`;

const Tweets = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 90%;
    white-space: normal;
    word-break: break-all; 
    overflow-wrap: break-word; 
    word-wrap: break-word;
`;

const Name = styled.div`
    display:flex;
    flex-direction: column;
    align-items: center;
    font-size: 22px;
`;

const EditButton = styled.div`
    display: flex;
    display: inline-block;
    align-items: center;
    flex-direction: row-reverse;
    text-align: center;
    cursor: pointer;
    width: 60px;
    svg{
        width: 30px;
    }
`;
const TextArea = styled.textarea`
    border: 1px solid white;
    padding: 2px;
    border-radius: 10px;
    font-size: 22px;
    color: white;
    background-color: black;
    width: 40%;
    resize: none;
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const TextOne = styled.div`
    padding-top: 30px;
    text-align: left;
`;

const DeleteId = styled.div`
    margin-left: auto;
    margin-right: 10px;
    border-radius: 2px;
    cursor: pointer;
`;

export interface userInfo{
    id: number,
    username: string,
    email: string,
    profileImage: string
}

export default function Profile() {
    const [user, setUser] = useState<userInfo>();
    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    const [inputText, setInputText] = useState(user?.username || "Anonymous");
    const [isEditing, setEditing] = useState(false);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [profileUpdate, setProfileUpdate] = useState(false);
    const navigate = useNavigate();
    const csrfToken = useSelector((state:any)=>state.csrfToken);
    const dispatch = useDispatch();

    function updateAction() {
        setProfileUpdate((profileUpdate)=>!profileUpdate);
    }

    useEffect(()=>{
        const fetchTweets = async() => {
            try{
            const response = await axios.get("http://localhost:8080/api/board/user",{withCredentials : true});
            setTweets(response.data.content);
            }catch(e){
                if(e instanceof AxiosError) {
                    console.log(e.message);
                    alert("Please Log in");
                    navigate("/login");
                }
            }
        };
        const userInfo = async() => {
            try{
                const response:{data:userInfo} = await axios.get("http://localhost:8080/api/user",{withCredentials : true});
                setUser(response.data);
                setAvatar(response.data?.profileImage);
            }catch(e){
                if(e instanceof AxiosError) {
                    console.log(e.message);
                }
            }
        }

        const getToken = async(token:string)=>{
            dispatch({type: "SET_STRING", payload : token});
        }
        if(csrfToken === "null"){
            CsrfToken().then(token => {
                getToken(token);
            });
        }
        userInfo();
        fetchTweets();
    }, [profileUpdate, avatar]); 

    const onAvatarCahange = async (e:React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if(!user) return;
        if(!files || files.length === 0) return;
        if(files[0].size > 1 * 1024 * 1024) {
            alert("Image file size should be less than 2Mb");
            return;
        };
        try{
            if(user === null) return
            const formData = new FormData
            formData.append("file", files[0]);

            const response = await axios.patch("http://localhost:8080/api/user",formData, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                withCredentials : true,
            });

            if(response.status == 200) {
                setAvatar(response.data?.profileImage + '?t=' + Date.now());
                updateAction();
            }
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("Please Log in");
                navigate("/login");
            }
        }finally{
            updateAction();
        }
    }

    const onEdit = () => {
        setEditing(!isEditing);
        setInputText(user?.username || "");
    }

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);  // username
    }

    const handleKeyPress = (event: any) => {
        if (event.key === "Enter") {
        event.preventDefault();    
        editDone()
        }
    };

    const editDone = async ()=> {
        const ok = confirm("Are you sure you want to edit this profile?");
        if(!ok || !user) return;
        const special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
        if(inputText!.search(/\s/g) > -1 || inputText === "") {
            alert("There is a blank space in your name.");
        }else if(special_pattern.test(inputText!) == true){
            alert("You can't use special characters.");
        }else{
            console.log("you can use");
            try{
                if(user === null) return
                const formData = new FormData
                formData.append("username", inputText);

                const response = await axios.patch("http://localhost:8080/api/user",formData, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    withCredentials : true,
                });

                if(response.status == 200) {
                    updateAction();
                    onEdit();
                }
            }catch(e){  
                console.log(e);
                if(e instanceof AxiosError) {
                    if(e.status === 401){
                        alert("Please Log in");
                        navigate("/login");
                    }else if(e.status === 500){
                        alert("You can't use");
                    }
                }
                
            }
        }
    }

    const ondelete = async()=>{
        let okConfirm = false;
        const ok = confirm("Are you sure you want to delete this?");
        if(ok) {okConfirm = confirm("All your data delete")};
        if(!ok || !user || !okConfirm) return;
        try{
            const response = await axios.delete("http://localhost:8080/api/user", {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                withCredentials : true,
            });

            if(response.status == 200) {
                window.sessionStorage.removeItem("user");
                dispatch({type: "SET_LOGIN", payload: false});
                navigate("/");
            }
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("Please Log in");
                navigate("/login");
            }
        }
    }
    return (
        <Wrapper>
            <DeleteId onClick={ondelete}>DEL ID</DeleteId>
            <AvatarUpload htmlFor="avatar">
                {avatar ? <AvatarImg src={avatar}/> : <svg fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>}
            </AvatarUpload>
            <AvatarInput onChange={onAvatarCahange} id="avatar" type="file" accept="image/*"/>
            <Name>
                {isEditing ? <TextArea onChange={onChange} rows={1} maxLength={20} onKeyDown={handleKeyPress} value={inputText as string} required /> : user?.username || "Anonymous"}
                <EditButton>
                    {isEditing ? <svg onClick={onEdit} fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg> : <svg onClick={onEdit} data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path>
                    </svg>}
                    {isEditing ? <svg onClick={editDone} data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                    </svg> : null}
                </EditButton>
            </Name>
            <TextOne>
                My Tweets
            </TextOne>
            <Tweets>
                {tweets.map(tweet => <Tweet key={tweet.boardId} {...tweet} onTweetPosted={updateAction}/>)}
            </Tweets>
        </Wrapper>
    )
}