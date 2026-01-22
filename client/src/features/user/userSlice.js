import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import { toast } from 'react-hot-toast'

const initialState = {
    value: null,
    loading: false,
    error: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token, {rejectWithValue}) => {
    try {
        console.log('fetchUser called with token:', token ? 'Yes' : 'No')
        
        const {data} = await api.get('/api/user/data', {
            headers: {Authorization: `Bearer ${token}`}
        })
        
        console.log('Backend response:', data)
        
        if (data.success) {
            console.log('User data fetched successfully:', data.user)
            return data.user
        } else {
            console.error('Backend returned success: false', data.message)
            toast.error(data.message || 'Failed to fetch user data')
            return rejectWithValue(data.message)
        }
    } catch (error) {
        console.error('Error in fetchUser:', error)
        console.error('Error response:', error.response?.data)
        toast.error(error.response?.data?.message || 'Failed to fetch user data')
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

export const updateUser = createAsyncThunk('user/update', async ({userData, token}, {rejectWithValue}) => {
    try {
        const {data} = await api.post('/api/user/update', userData, {
            headers: {Authorization: `Bearer ${token}`}
        })
        
        if(data.success){
            toast.success(data.message)
            return data.user
        }else{
            toast.error(data.message)
            return rejectWithValue(data.message)
        }
    } catch (error) {
        console.error('Error updating user:', error)
        toast.error(error.response?.data?.message || 'Failed to update user')
        return rejectWithValue(error.response?.data?.message || error.message)
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUser: (state) => {
            state.value = null
            state.loading = false
            state.error = null
        }
    },
    extraReducers: (builder)=>{
        builder
            // fetchUser cases
            .addCase(fetchUser.pending, (state) => {
                state.loading = true
                state.error = null
                console.log('fetchUser pending...')
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false
                state.value = action.payload
                state.error = null
                console.log('fetchUser fulfilled, user set to:', action.payload)
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                console.error('fetchUser rejected:', action.payload)
            })
            // updateUser cases
            .addCase(updateUser.pending, (state) => {
                state.loading = true
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false
                state.value = action.payload
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer