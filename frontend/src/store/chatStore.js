import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// --- Async Thunks (Handling API calls) ---

export const getAllContacts = createAsyncThunk(
  "chat/getAllContacts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/messages/all-contacts");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading contacts");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getMyChatPartners = createAsyncThunk(
  "chat/getMyChatPartners",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/messages/chats");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading chats");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getMessagesByUserId = createAsyncThunk(
  "chat/getMessagesByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { getState, dispatch, rejectWithValue }) => {
    // 1. Get required state from across Redux
    const { chat, auth } = getState(); 
    const { selectedUser } = chat;
    const { authUser } = auth; // Cleanly grabs auth state from your other slice

    if (!selectedUser || !authUser) return rejectWithValue("Missing user context");

    const tempId = `temp-${Date.now()}`;

    // 2. Build the optimistic message matching your Zustand format
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // 3. Update UI immediately via a local reducer action
    dispatch(addOptimisticMessage(optimisticMessage));

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      
      // 4. Return success payload along with tempId to swap it out
      return { serverMessage: res.data, tempId };
    } catch (error) {
      // 5. If it fails, remove the optimistic message
      dispatch(removeOptimisticMessage(tempId));
      toast.error(error.response?.data?.message || "Something went wrong");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// --- Slice Definition ---

const initialState = {
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    toggleSound: (state) => {
      state.isSoundEnabled = !state.isSoundEnabled;
      localStorage.setItem("isSoundEnabled", state.isSoundEnabled);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    addOptimisticMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    removeOptimisticMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
    // Action called when socket receives a new message natively
    receiveNewMessage: (state, action) => {
      const newMessage = action.payload;
      
      // Safety check: Only push if the message belongs to current active chat layout
      if (state.selectedUser && newMessage.senderId === state.selectedUser._id) {
        state.messages.push(newMessage);

        // Handle Audio Notification natively from state setting configurations
        if (state.isSoundEnabled) {
          const notificationSound = new Audio("/notification.mp3");
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // getAllContacts
      .addCase(getAllContacts.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getAllContacts.fulfilled, (state, action) => {
        state.allContacts = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getAllContacts.rejected, (state) => {
        state.isUsersLoading = false;
      })

      // getMyChatPartners
      .addCase(getMyChatPartners.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getMyChatPartners.fulfilled, (state, action) => {
        state.chats = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getMyChatPartners.rejected, (state) => {
        state.isUsersLoading = false;
      })

      // getMessagesByUserId
      .addCase(getMessagesByUserId.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessagesByUserId.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.isMessagesLoading = false;
      })
      .addCase(getMessagesByUserId.rejected, (state) => {
        state.isMessagesLoading = false;
      })

      // sendMessage (Success block swapping out the optimistic message)
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { serverMessage, tempId } = action.payload;
        state.messages = state.messages.map((m) =>
          m._id === tempId ? serverMessage : m
        );
      });
  },
});

export const {
  toggleSound,
  setActiveTab,
  setSelectedUser,
  addOptimisticMessage,
  removeOptimisticMessage,
  receiveNewMessage,
} = chatSlice.actions;

export default chatSlice.reducer;