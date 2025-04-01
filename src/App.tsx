import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Protected from "./auth/Protected";
import { IRootState } from "./redux/store";
import "./styles/App.css";
import Fallback from "./utils/loaders/Fallback";
import Toast from "./utils/alert/Toast";
import { SocketProvider } from "./Socket";
import { setMobile } from "./redux/slice/mobile";

const PageProfile = lazy(() => import("./pages/common/PageProfile"));
const Post = lazy(() => import("./pages/user/Post"));
const Chats = lazy(() => import("./pages/user/Chats"));
const All = lazy(() => import("./pages/user/All"));
const Profile = lazy(() => import("./pages/user/Profile"));
const Login = lazy(() => import("./pages/common/Login"));
const Signup = lazy(() => import("./pages/common/Signup"));
const Edit = lazy(() => import("./pages/user/Edit"));
const Notfound = lazy(()=>import("./pages/common/Notfound"));
const Postusers = lazy(()=>import("./pages/common/Postusers"));


function App() {
  const { post } = useSelector((state: IRootState) => state.sidebar);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = post ? "Create new post • Instagram" : "Instagram";
  }, [post]);

  useEffect(()=>{
    window.onresize = () => {
      if(window.innerWidth <= 900){
        dispatch(setMobile(true));
      }else{
        dispatch(setMobile(false));
      }
    }
  })

  return (
    <Router>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <SocketProvider>
                <Protected />
              </SocketProvider>
            }
          >
            <Route path="/" element={<Post />} />
            <Route path="/message" element={<Chats />} />
            <Route path="/explore" element={<All />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit" element={<Edit />} />
            <Route path="/p/:id" element={<Postusers />} />
            <Route path="/:id" element={<PageProfile />} />
            <Route path="*" element={<Notfound />} />
          </Route>
        </Routes>
      </Suspense>
      <Toast />
    </Router>
  );
}

export default App;
