import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "./components/layout"
import Profile from "./routes/profile"
import Home from "./routes/home"
import Login from "./routes/login"
import CreateAccount from "./routes/create-account"
import styled, { createGlobalStyle } from "styled-components"
import reset from "styled-reset"
import { useEffect, useState } from "react"
import LoadingScreen from "./components/loading-screen"
import ProtectedRoute from "./components/protected-rout"

const router = createBrowserRouter([
  {
    path:"/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: 
        //<ProtectedRoute>
          <Home />
        //</ProtectedRoute>,
      },
      {
        path: "/profile",
        element: 
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/create-account",
    element: <CreateAccount />
  }
])

const GlobalStyles = createGlobalStyle`
  ${reset};
  @font-face {
    font-family: 'CookieRun';
    src: url('/fonts/CookieRun-Regular.otf') format('opentype');
    font-weight: thin;
    font-style: normal;
  }
  * {
    box-sizing: border-box;
  }
  body {
    background-color: #000716;
    color: white;
    font-family: 'CookieRun', sans-serif;

  }
  textarea,
  select {
    font-family: 'CookieRun', sans-serif;
  }
  input,
  button {
    font-family: 'CookieRun', sans-serif;
  }
  ::-webkit-scrollbar{
    display: none;
    /* background: #262421; 
    border: 2px solid #262421; 
    border-radius: 12px 12px 12px 12px;
    width: 5px; */
  }
`;

const Wrapper = styled.div`
  height: 100hv;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setLading] = useState(true);
  const init = async() => {
    setLading(false);
  }
  useEffect(()=>{init();},[])
  return <Wrapper>
    <GlobalStyles />
    {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
  </ Wrapper>
}

export default App
