

import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  // Check localStorage so data survives a refresh
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  loading: false,
}

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setUser(state, value) {
      state.user = value.payload
      // Save to localStorage when user is set
      localStorage.setItem("user", JSON.stringify(value.payload))
    },
    setLoading(state, value) {
      state.loading = value.payload
    },
  },
})

export const { setUser, setLoading } = profileSlice.actions
export default profileSlice.reducer