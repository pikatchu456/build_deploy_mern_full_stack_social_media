import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import {useAuth, useUser} from '@clerk/clerk-react'
import Layout from './pages/Layout'
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import {useDispatch} from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { useSelector } from 'react-redux'
import { fetchConnections } from './features/connections/connectionSlice.js'
import { useRef } from 'react'
import { UserLock } from 'lucide-react'
import Notification from './components/Notification.jsx'
import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { addMessage } from './features/messages/messagesSlice.js'


function App() {
    const { isLoaded, isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const { pathname } = useLocation();
    const pathnameRef = useRef(pathname);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (isLoaded && isSignedIn && user) {
                try {
                    console.log('Clerk user:', user);
                    const token = await getToken();
                    console.log('Clerk token:', token);
                    
                    if (token) {
                        await dispatch(fetchUser(token)).unwrap();
                        await dispatch(fetchConnections(token)).unwrap();
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            } else if (isLoaded && !isSignedIn) {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [isLoaded, isSignedIn, user, getToken, dispatch]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

  return (
        <>
            <Toaster />
            <ErrorBoundary>
            <Routes>
                <Route path='/' element={!isSignedIn ? <Login /> : <Layout />}>
                  <Route index element={<Feed />}/>
                  <Route path='messages' element={<Messages />}/>
                  <Route path='messages/:userId' element={<ChatBox />}/>
                  <Route path='connections' element={<Connections />}/>
                  <Route path='discover' element={<Discover />}/>
                  <Route path='profile' element={<Profile />}/>
                  <Route path='profile/:profileId' element={<Profile />}/>
                  <Route path='create-post' element={<CreatePost />}/>
                </Route>
            </Routes>
            </ErrorBoundary>
    </>
  )
}

export default App