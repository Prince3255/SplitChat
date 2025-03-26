import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
  isAuthenticated: false,
  onlineUsers: [],
  selectedUser: null,
  calling: false,
};

const usserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUserSuccess: (state, action) => {
      (state.currentUser.profilePicture = action.payload),
        (state.loading = false);
      state.error = null;
      state.calling = false;
    },
    logoutUserSuccess: (state) => {
      (state.currentUser = null), (state.loading = false);
      state.error = null;
      state.isAuthenticated = false;
      state.onlineUsers = [];
      state.selectedUser = null;
      state.calling = false;
    },
    authenticateState: (state, action) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setCalling: (state, action) => {
      state.calling = action.payload;
    },
  },
});

export const {
  updateUserSuccess,
  logoutUserSuccess,
  authenticateState,
  setOnlineUsers,
  setSelectedUser,
  setCalling,
} = usserSlice.actions;

export default usserSlice.reducer;
