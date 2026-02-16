import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: {}, token: '' },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.token = accessToken;
      state.user = user;
    },
    logOut: (state, action) => {
      state.user = {};
      state.token = {};
      state.permissions = {};
      state.institutionName = {};
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export const selectCurrentUser = state => state.auth.user;
export const selectCurrentToken = state => state.auth.token;
export default authSlice.reducer;
