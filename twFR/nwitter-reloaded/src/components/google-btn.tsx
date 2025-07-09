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
    const baseUrl = import.meta.env.VITE_SERVER_URL;
    const onClick = async () => {
        console.log(baseUrl);
        const popup = window.open(
                baseUrl+"/oauth2/authorization/google", 
                'oauth2Popup',
                'width=500,height=600'
            );
        // 팝업이 정상적으로 떴을 때만 polling
        const receiveMessage = (event:MessageEvent) => {
            if(event.origin !== baseUrl) {
                return;
            }
            if (event.data === "oauth-success") {
                cleanup(); // 성공 시 정리 함수 호출
                window.location.href = "/";
            }
        };

        const popupCheck = setInterval(() => {
            if (popup && popup.closed) {
                cleanup(); // 사용자가 직접 닫았을 때도 정리 함수 호출
            }
        }, 500);

        const cleanup = () => {
            window.removeEventListener("message", receiveMessage);
            clearInterval(popupCheck);
            if (popup) popup.close();
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