import styled from "styled-components";
import { useEffect, useState } from "react";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import axios, { AxiosError } from "axios";
import axiosConfig from "../api/axios"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

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

export interface IuserInfo{
    id: number,
    username: string,
    email: string,
    profileImage: string
}

export default function Profile() {
    const [userInfo, setUserInfo] = useState<IuserInfo>();
    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    const [inputText, setInputText] = useState(userInfo?.username || "Anonymous");
    const [isEditing, setEditing] = useState(false);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [profileUpdate, setProfileUpdate] = useState(false);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchTweets = async(page = 0) => {
        try{
        const response = await axiosConfig.get("/api/board/user",{
            params: {
                page: page
            }
        });
        const newTweets = response.data.content;
        setTweets(prev => 
            page === 0 
                ? newTweets // 처음 페이지
                : [...prev, ...newTweets] // 기존 페이지 + 새 페이지
        );
        // 마지막 페이지인지 판단
        setHasMore(!response.data.last);
        }catch(e){
            if(e instanceof AxiosError) {
                console.log(e.message);
                alert("로그인이 필요합니다.");
                navigate("/login");
            }
        }
    };

    function updateAction() {
        setProfileUpdate((profileUpdate)=>!profileUpdate);
    }

    useEffect(()=>{
        const fetchUserInfo = async() => {
            try{
                const response:{data:IuserInfo} = await axiosConfig.get("/api/user");
                setUserInfo(response.data);
                setAvatar(response.data?.profileImage);
            }catch(e){
                if(e instanceof AxiosError) {
                    console.log(e.message);
                }
            }
        }
        fetchUserInfo();
    }, [profileUpdate, avatar]); 

    useEffect(() => { // 첫 로딩시 페이지 초기화
        setPage(0);
        setHasMore(true);
    }, []);

    useEffect(() => {
        fetchTweets(page);
    }, [page,profileUpdate]);
    
    useEffect(() => { // 스크롤 인식
        const handleScroll = () => {
            const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
                setPage(prev => prev + 1); // 다음 페이지로
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading]);

    const onAvatarCahange = async (e:React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if(!userInfo) return;
        if(!files || files.length === 0) return;
        if(files[0].size > 2 * 1024 * 1024) {
            alert("최대 2Mb의 이미지를 사용할 수 있습니다.");
            return;
        };
        try{
            if(userInfo === null) return
            const formData = new FormData
            formData.append("file", files[0]);

            const response = await axiosConfig.patch("/api/user",formData);

            if(response.status == 200) {
                setAvatar(response.data?.profileImage + '?t=' + Date.now());
                updateAction();
            }
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.status === 401) {
                alert("로그인이 필요합니다.");
                navigate("/login");
            }
        }finally{
            updateAction();
        }
    }

    const onEdit = () => {
        setEditing(!isEditing);
        setInputText(userInfo?.username || "");
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
        const ok = confirm("이름을 변경하시겠습니까?");
        if(!ok || !userInfo) return;
        const special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
        if(inputText!.search(/\s/g) > -1 || inputText === "") {
            alert("이름에 공백은 사용할 수 없습니다.");
        }else if(special_pattern.test(inputText!) == true){
            alert("이름에 특수문자는 사용할 수 없습니다.");
        }else{
            console.log("you can use");
            try{
                if(userInfo === null) return
                const formData = new FormData
                formData.append("username", inputText);

                const response = await axiosConfig.patch("/api/user",formData);

                if(response.status == 200) {
                    updateAction();
                    onEdit();
                }
            }catch(e){  
                console.log(e);
                if(e instanceof AxiosError) {
                    if(e.response?.status === 401){
                        alert("로그인이 필요합니다.");
                        navigate("/login");
                    }else if(e.response?.status === 500){
                        alert("이미 사용중인 이름입니다.");
                    }
                }
            }
        }
    }

    const ondelete = async()=>{
        let okConfirm = false;
        const ok = confirm("계정을 삭제하시겠습니까?");
        if(ok) {okConfirm = confirm("모든 데이터가 삭제됩니다.")};
        if(!ok || !userInfo || !okConfirm) return;
        try{
            const response = await axiosConfig.delete("/api/user");

            if(response.status == 200) {
                dispatch({type: "SET_USER", payload: null});
                console.log("del user");
                navigate("/");
            }
        }catch(e){  
            console.log(e);
            if(e instanceof AxiosError && e.response?.status === 401) {
                alert("로그인이 필요합니다.");
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
                {isEditing ? <TextArea onChange={onChange} rows={1} maxLength={20} onKeyDown={handleKeyPress} value={inputText as string} required /> : userInfo?.username || "Anonymous"}
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