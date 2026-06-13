import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000" : "/";

// --- Async Thunks (Handling API calls) ---

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/check-authentication");
      console.log(res.data, "check auth");
      
      // Automatically connect socket on successful auth check
      dispatch(connectSocket());
      return res.data; 
    } catch (error) {
      console.log("Error in authCheck:", error);
      console.log(error.response?.data?.message || error.message, "check auth error");
      return rejectWithValue(null);
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/register", data);
      console.log(res.data, "signup");
      
      toast.success("Account created successfully!");
      dispatch(connectSocket());
      return res.data.user;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log(res.data, "login");
      
      toast.success("Logged in successfully");
      dispatch(connectSocket());
      return res.data.user;
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out successfully");
      dispatch(disconnectSocket());
      return null;
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/auth/updateProfile", data);
      console.log(res.data, "update profile");
      toast.success("Profile updated successfully");
      return res.data.user;
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- Slice Definition ---

const initialState = {
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Socket management methods
    connectSocket: (state) => {
      if (!state.authUser || state.socket?.connected) return;

      // NOTE: Storing complex/non-serializable objects like socket instances in Redux 
      // is generally discouraged, but done here to parity your Zustand logic.
      const socket = io(BASE_URL, {
        withCredentials: true,
      });

      socket.connect();
      state.socket = socket;
    },
    disconnectSocket: (state) => {
      if (state.socket?.connected) {
        state.socket.disconnect();
      }
      state.socket = null;
    },
    setOnlineUsers: (state, action) => {
      console.log(action.payload, "getonlineusers");
      
      state.onlineUsers = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      })
      
      // signup
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isSigningUp = false;
      })

      // login
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })

      // updateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload;
      });
  },
});

export const { connectSocket, disconnectSocket, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;