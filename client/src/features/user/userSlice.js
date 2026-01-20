import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import { toast } from 'react-hot-toast'


const initialState = {
    value: null
}

export const fetchUser = createAsyncThunk('users/fetchUser', async (token, { rejectWithValue }) => {
    try {
        console.log('Fetching user data with token');
        const { data } = await api.get('/api/users/data', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Response from /api/users/data:', data);
        
        if (data.success) {
            console.log('User data fetched successfully:', data.user);
            return data.user;
        } else {
            console.log('Failed to fetch user data:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        console.error('Error response:', error.response?.data);
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updateUser = createAsyncThunk('users/update', async ({userData, token}) => {
    const {data} = await api.post('/api/users/update ', userData, {
        headers: {Authorization: `Bearer ${token}`}
    })
    if(data.success){
        toast.success(data.message)
        return data.user
    }else{
        toast.error(data.message)
        return null
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

    },
    extraReducers: (builder)=>{
        builder.addCase(fetchUser.fulfilled, (state, action)=>{
            state.value = action.payload
        }).addCase(updateUser.fulfilled, (state, action)=>{
            state.value = action.payload
        })
    }
})

export default userSlice.reducer