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
    replies: [];
    onTweetPosted: () => void;
}

export interface ReplyList {
    id : number;
    boardId : number;
    memberId: number;
    insertTime: number;
    updateTime: number;
    memberName: string;
    content: string;
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
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const csrfToken = useSelector((state:any) => state.csrfToken);
    const dispatch = useDispatch(); 

    const fetchTweets = async(page = 0) => {
        setLoading(true);
        try{
            const response = await axios.get(`http://localhost:8080/api/board`, {
            params: {
                page: page
            },
            withCredentials: true
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
                alert("Server is down");
                window.sessionStorage.removeItem("user");
                dispatch({type: "SET_LOGIN", payload: false});
                //navigate("/login");
            }
        }finally{
            setLoading(false);
        }
    }

    const getToken = async(token:string)=>{
        dispatch({type: "SET_STRING", payload : token});
    }
        
    useEffect(() => { // csrf 토큰이 없다면 재발급
        if(csrfToken === null){
            CsrfToken().then(token => {
                getToken(token);
            }).catch(error => {
                console.log(error);
                dispatch({type: "SET_LOGIN", payload: false});
            });
        }
    }, [tweetsUpdated]); 

    useEffect(() => { // 첫 로딩시 페이지 초기화
        setPage(0);
        setHasMore(true);
    }, [tweetsUpdated]);

    useEffect(() => {
        fetchTweets(page);
    }, [page,tweetsUpdated]);

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

    return (<Wrapper> 
        {tweets.map(tweet => <Tweet key={tweet.boardId} {...tweet} onTweetPosted={onTweetPosted} />)}
    </Wrapper>
    )
}