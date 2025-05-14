import type { FormEvent } from 'react';
import { type Socket, io } from 'socket.io-client';
import { create } from 'zustand';

export enum EventTypes {
  BOT_RESPONSE = 'bot_response',
  USER_PROMPT = 'user_prompt'
}
interface IMessage {
  _id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  event: string;
}

interface IBotPrompts {
  content: string;
  _id: string;
  event: string;
}

type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

interface BotResponse {
  message: string;
  sessionId: string;
  event: EventTypes;
}

interface BorError {
  message: string;
  sessionId: string;
  restart: boolean;
  updateSession?: boolean;
}

interface ChatState {
  sessionId: string;
  connectionStatus: ConnectionStatus;
  socket: Socket | null;
  currentStream: string;
  messages: IMessage[];
  isLoading: boolean;
  inputValue: string;
  resumedSession: boolean;

  handleBotResponse: (response: BotResponse) => void;
  initializeSocket: () => void;
  handleSocketErrors: (error: BorError) => void;
  handleInitialization: (data: { messageHistory: IMessage[] }) => void;
  sendMessage: (e: FormEvent) => Promise<void>;
  setInputValue: (value: string) => void;
  simulateStreaming: (data: IBotPrompts) => void;
}

// Helper functions
const generateSessionId = () => {
  const id = `${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
  localStorage.setItem('dondy_chat_sessionId', id);
  return id;
};
const generateRandomId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: '',
  connectionStatus: 'connecting' as const,
  socket: null,
  resumedSession: false,
  messages: [
    {
      _id: generateRandomId(),
      event: EventTypes.BOT_RESPONSE,
      content: `Hey! I'm your Lead Assistant AI here at Dondy. I'll ask you a few quick questions to better understand your needs and see how we can help—let's get started! Just drop me a quick message to begin.`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  currentStream: '',
  isLoading: false,
  inputValue: '',

  initializeSocket: () => {
    let sessionId =
      localStorage.getItem('dondy_chat_sessionId') || generateSessionId();

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      auth: {
        sessionId
      }
    });

    if (socket.disconnected) socket.connect();

    set({ socket, sessionId });

    const socketEvents = {
      connecting: () => set({ connectionStatus: 'connecting' }),
      connect: () => set({ connectionStatus: 'connected' }),
      disconnect: () => set({ connectionStatus: 'disconnected' }),
      error: get().handleSocketErrors,
      initialize: get().handleInitialization,
      bot_response: get().handleBotResponse
    };

    Object.entries(socketEvents).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    socket.io.on('reconnect_attempt', () =>
      set({ connectionStatus: 'connecting' })
    );
  },

  handleBotResponse: (response) => {
    const { message, sessionId, event } = response;
    if (sessionId !== get().sessionId) return;

    set({
      isLoading: true
    });

    get().simulateStreaming({
      content: message,
      _id: generateRandomId(),
      event
    });
  },

  handleSocketErrors: (error) => {
    const { sessionId, restart, message, updateSession } = error;

    if (sessionId !== get().sessionId) return;

    if (restart) {
      localStorage.removeItem('dondy_chat_sessionId');

      set({
        sessionId: updateSession ? sessionId : generateSessionId(),
        resumedSession: !!updateSession,
        currentStream: '',
        isLoading: true
      });

      get().simulateStreaming({
        content: message,
        _id: generateRandomId(),
        event: EventTypes.BOT_RESPONSE
      });
      return;
    }

    set({ isLoading: true });
    get().simulateStreaming({
      content: message || 'An error occurred! Please try again',
      _id: generateRandomId(),
      event: EventTypes.BOT_RESPONSE
    });
  },

  sendMessage: async (event) => {
    event.preventDefault();
    const inputValue = get().inputValue.trim();
    if (!inputValue) return;

    const { socket } = get();

    if (!socket) return;

    set((state) => ({
      isLoading: true,
      inputValue: '',
      messages: [
        ...state.messages,
        {
          _id: generateRandomId(),
          event: EventTypes.USER_PROMPT,
          content: inputValue,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }));

    socket.emit('message', {
      content: inputValue,
      resumedSession: get().resumedSession
    });
  },

  setInputValue: (value) => set({ inputValue: value }),

  simulateStreaming: async (data) => {
    const { content, _id, event } = data;

    const chunks = content?.split(' ') || [];

    await new Promise((resolve) => setTimeout(resolve, 500));

    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        const isLastChunk = index === chunks.length - 1;

        set((state) => ({
          isLoading: false,
          currentStream: isLastChunk ? '' : state.currentStream + chunk + ' ',
          ...(isLastChunk && {
            messages: [
              ...state.messages,
              {
                _id,
                content,
                event,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          })
        }));
      }, 50 * index);
    });
  },

  handleInitialization: (initialData) => {
    console.log(initialData);
    const { messageHistory } = initialData;

    if (!messageHistory) return;
    set((state) => ({
      isLoading: false,
      messages: [
        ...state.messages,
        ...messageHistory.map((m) => ({
          content: m.content,
          _id: m._id,
          event: m.event,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        }))
      ]
    }));
  }
}));
