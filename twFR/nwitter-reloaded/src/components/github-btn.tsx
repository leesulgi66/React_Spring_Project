import styled from "styled-components"
import { useNavigate } from "react-router-dom";

const Button = styled.span`
    margin-top: 40px;
    background-color: white;
    font-weight: 500;
    width: 100%;
    color: black;
    padding : 10px 20px;
    border-radius: 50px;
    border: 0;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const Logo = styled.img`
    height: 25px;
`;

export default function GithubButton() {
    const navigate = useNavigate();
    const onClick = async () => {
        try {
            console.log(11);
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <Button onClick={onClick}>
            <Logo src="/github-logo.svg" />
            Continue with Github
        </Button>
    );
}