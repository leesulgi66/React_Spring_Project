import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios, { AxiosError } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
    display: grid;
    margin: 0 10px;
    gap : 30px;
    grid-template-columns: 1fr 6fr;
    height: 100%;
    padding : 50px 0px;
    width: 100%;
    max-width: 860px;
    @media (max-width:550px) {
        display: block;
    }
`;

const Menu = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    @media (max-width:550px) {
        margin: 0 0 10px 0;
        flex-direction: row;
        justify-content: center;
    }
`;

const MenuItem = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    height: 50px;
    width: 50px;
    border-radius: 50%;
    svg {
        width: 30px;
        fill: white;
    }
    &.log-out {
        border-color: #11487e;
        svg{
            fill: dodgerblue;
        }
    }
    &.log-in{
        border-color: #854187;
    }
`;

export default function Layout() {
    const [user, setUser] = useState(window.sessionStorage.getItem("user"));
    const navigate = useNavigate();
    const csrfToken = useSelector((state:any) => state.csrfToken);
    const loginState = useSelector((state:any) => state.login);
    const dispatch = useDispatch();

    useEffect(()=>{
        setUser(window.sessionStorage.getItem("user"));
    },[]);
    useEffect(() => {
        dispatch({ type: "SET_LOGIN", payload: user !== null });
    }, [user, dispatch]);

    if(user !== null) {
        dispatch({type: "SET_LOGIN", payload: true});
    }

    const onLogIn = ()=> {
        navigate("/login")
    }

    const onLogOut = async() => {
        const ok = confirm("로그아웃을 원하십니까?");
        if(ok) {
            try{
                const response = await axios.post("http://localhost:8080/logout",{},{
                    withCredentials : true,
                    headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    },
                });
                if(response.status === 200){
                    setUser(null);
                    window.sessionStorage.removeItem("user");
                    dispatch({type: "SET_LOGIN", payload: false});
                    navigate("/");
                }
            }catch(e){
                console.log(e);
                //navigate("/login");
            }finally {
                setUser(null);
                window.sessionStorage.removeItem("user");
                dispatch({type: "SET_LOGIN", payload: false});
                document.cookie = "JSESSIONID" + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
            }
        }
    }
    return (
        <Wrapper>
            <Menu>
                <Link to="/">
                    <MenuItem>
                        <svg data-slot="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clip-rule="evenodd" fill-rule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"></path>
                        </svg>
                    </MenuItem>
                </Link>
                <Link to="profile">
                    <MenuItem>
                        <svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"></path>
                        </svg>
                    </MenuItem>
                </Link>
                {loginState ? 
                <MenuItem onClick={onLogOut} className="log-out">
                    <svg data-slot="icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path clip-rule="evenodd" fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"></path>
                        <path clip-rule="evenodd" fill-rule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"></path>
                    </svg>
                </MenuItem> : 
                <MenuItem onClick={onLogIn} className="log-out, log-in">
                    <p>login</p>
                </MenuItem>}
            </Menu>
            <Outlet />
        </Wrapper>
    )
}