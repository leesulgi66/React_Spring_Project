import { useEffect, useState } from "react";
import styled from "styled-components";
import Tweet from "./tweet";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

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
    const dispatch = useDispatch();
    const fetchTweets = async() => {
        try{
        const response = await axios.get("http://localhost:8080/api/board",{withCredentials : true});
        setTweets(response.data.content);
        }catch(e){
            if(e instanceof AxiosError) {
                console.log(e.message);
                alert("Please Log in");
                navigate("/login");
            }
        }
    }

    const getToken = async()=>{
    try{
        const response = await axios.get("http://localhost:8080/api/csrf-token", { withCredentials: true })
            if(response.status == 200) {
                dispatch({type: "SET_STRING", payload : response.data.token});
            }
        }
        catch(e){
            console.log(e);
        }
    }
        
    useEffect(() => {
        fetchTweets();
        getToken();
    }, [tweetsUpdated]); 
    return (<Wrapper> 
        {tweets.map(tweet => <Tweet key={tweet.boardId} {...tweet} onTweetPosted={onTweetPosted} />)}
    </Wrapper>
    )
}