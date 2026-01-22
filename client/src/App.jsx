import React, { useEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import { useAuth, useUser } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import toast, { Toaster } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { fetchConnections } from './features/connections/connectionSlice.js'
import { addMessage } from './features/messages/messagesSlice.js'
import Notification from './components/Notification.jsx'

function App() {
  const { user, isLoaded: userLoaded } = useUser()
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useDispatch()
  const reduxUser = useSelector((state) => state.user.value)
  const userLoadingState = useSelector((state) => state.user.loading)

  // Log pour déboguer
  useEffect(() => {
    console.log('=== AUTH STATUS ===')
    console.log('Clerk user:', user)
    console.log('User loaded:', userLoaded)
    console.log('Auth loaded:', authLoaded)
    console.log('Is signed in:', isSignedIn)
    console.log('Redux user:', reduxUser)
    console.log('User loading state:', userLoadingState)
    console.log('==================')
  }, [user, userLoaded, authLoaded, isSignedIn, reduxUser, userLoadingState])

  useEffect(() => {
    const fetchData = async () => {
      // Attendre que Clerk soit chargé
      if (!authLoaded || !userLoaded) {
        console.log('Waiting for Clerk to load...')
        return
      }

      // Si l'utilisateur n'est pas connecté
      if (!user || !isSignedIn) {
        console.log('User not signed in')
        setIsLoading(false)
        return
      }

      // Si les données sont déjà chargées
      if (reduxUser) {
        console.log('User data already loaded')
        setIsLoading(false)
        return
      }

      // Charger les données utilisateur
      try {
        console.log('Starting to fetch user data...')
        setIsLoading(true)
        
        const token = await getToken()
        console.log('Token obtained:', token ? 'Yes' : 'No')
        
        if (!token) {
          console.error('No token available')
          toast.error('Authentication token not available')
          setIsLoading(false)
          return
        }
        
        const result = await dispatch(fetchUser(token))
        console.log('Dispatch result:', result)
        
        if (fetchUser.fulfilled.match(result)) {
          console.log('✅ User data loaded successfully')
          await dispatch(fetchConnections(token))
        } else {
          console.error('❌ Failed to load user data')
        }
        
      } catch (error) {
        console.error('Error in fetchData:', error)
        toast.error('Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, userLoaded, authLoaded, isSignedIn, reduxUser, getToken, dispatch])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (user && reduxUser) {
      console.log('Setting up SSE connection...')
      const eventSource = new EventSource(
        import.meta.env.VITE_BASEURL + '/api/message/' + user.id
      )
      
      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (pathnameRef.current === '/messages/' + message.from_user_id._id) {
          dispatch(addMessage(message))
        } else {
          toast.custom(
            (t) => <Notification t={t} message={message} />,
            { position: 'bottom-right' }
          )
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error)
        eventSource.close()
      }

      return () => {
        console.log('Closing SSE connection')
        eventSource.close()
      }
    }
  }, [user, reduxUser, dispatch])

  // Afficher un loader pendant le chargement de Clerk
  if (!authLoaded || !userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  // Afficher un loader pendant le chargement des données utilisateur
  if (isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App