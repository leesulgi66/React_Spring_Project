import styled from "styled-components"

const Button = styled.span`
    margin-top: 30px;
    background-color: #ffffff;
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

export default function GoogleButton() {
    const BACKEND_ORIGIN = "http://119.201.41.172:8080";
    const onClick = async () => {
        const popup = window.open(
                "http://119.201.41.172:8080/oauth2/authorization/google", 
                'oauth2Popup',
                'width=500,height=600'
            );
        // 팝업이 정상적으로 떴을 때만 polling
        const receiveMessage = (event:MessageEvent) => {
            if(event.origin !== BACKEND_ORIGIN) {
                return;
            }
            if (event.data === "oauth-success") {
                window.location.href = "/";
                window.removeEventListener("message", receiveMessage);
                if (popup) popup.close();
            }
        };

        window.addEventListener("message", receiveMessage);
    };
    return (
        <Button onClick={onClick}>
            <Logo src="/social-img-google.png" />
            Continue with Google
        </Button>
    );
}