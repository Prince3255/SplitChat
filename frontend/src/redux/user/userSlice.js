import { createSlice } from '@reduxjs/toolkit'
import { persistor } from '../store'

const initialState = {
    currentUser: null,
    error: null,
    loading: false,
    isAuthenticated: false,
    onlineUsers: [],
    selectedUser: null,
}

const usserSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUserSuccess: (state, action) => {
            state.currentUser.profilePicture = action.payload,
            state.loading = false
            state.error = null
        },
        logoutUserSuccess: (state) => {
            state.currentUser = null,
            state.loading = false
            state.error = null
            state.isAuthenticated = false
            state.socket = null
            state.onlineUsers = []
            state.selectedUser = null;
            persistor.purge()
        },
        authenticateState: (state, action) => {
            state.isAuthenticated = true
            state.currentUser = action.payload
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload
        }
    }
})

export const { updateUserSuccess, logoutUserSuccess, authenticateState, setOnlineUsers, setSelectedUser } = usserSlice.actions

export default usserSlice.reducer