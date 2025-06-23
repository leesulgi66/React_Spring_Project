import { useEffect, useState } from "react";
import styled from "styled-components";
import Tweet from "./tweet";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CsrfToken from "./csrfTokenGet";

export interface ITweet {
    boardId: number;
    memberId: number;
    photo? : string;
    photoKey?: string;
    tweet: string;
    memberName: string;
    insertTime: number;
    updateTime: number;
    onTweetPosted: () => void;
}

const Wrapper = styled.div`
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: scroll;
`;

export default function Timeline({ tweetsUpdated, onTweetPosted }: { tweetsUpdated: boolean , onTweetPosted: () => void}) {
    const [tweets, setTweets] = useState<ITweet[]>([]);   
    const navigate = useNavigate();
    const csrfToken = useSelector((state:any) => state.csrfToken);
    const dispatch = useDispatch();
    const fetchTweets = async() => {
        try{
        const response = await axios.get("http://localhost:8080/api/board",{withCredentials : true});
        setTweets(response.data.content);
        console.log(response.data)
        }catch(e){
            if(e instanceof AxiosError) {
                console.log(e.message);
                alert("Server is down");
                window.sessionStorage.removeItem("user");
                dispatch({type: "SET_LOGIN", payload: false});
                //navigate("/login");
            }
        }
    }

    const getToken = async(token:string)=>{
        dispatch({type: "SET_STRING", payload : token});
    }
        
    useEffect(() => {
        fetchTweets();
        if(csrfToken === null){
            CsrfToken().then(token => {
                getToken(token);
            });
        }
    }, [tweetsUpdated]); 
    return (<Wrapper> 
        {tweets.map(tweet => <Tweet key={tweet.boardId} {...tweet} onTweetPosted={onTweetPosted} />)}
    </Wrapper>
    )
}