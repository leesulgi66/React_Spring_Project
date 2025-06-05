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
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>,
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
  * {
    box-sizing: border-box;
  }
  body {
    background-color: #000716;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

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
