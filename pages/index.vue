<template>
  <div class="flex flex-col min-h-screen">
    <div class="navbar bg-green-700 fixed top-0 left-0 z-50 h-16">
      <button
        class="btn btn-outline my-auto flex items-center mr-2 text-white w-20"
        @click.prevent="onClear"
        :disabled="isClearing"
      >
        Clear
      </button>
      <div class="m-auto text-lg text-white">Echo Bot</div>
      <button class="btn btn-accent my-auto flex items-center mr-2 text-white w-20" @click.prevent="onLogout">
        Logout
      </button>
    </div>
    <div class="mt-16 mb-36 w-full">
      <div class="flex flex-col w-full">
        <MessageItem
          v-for="(message, index) in messages"
          :key="index"
          :id="message.id"
          :role="message.role"
          :content="message.content"
          :createdAt="message.createdAt"
          :class="message.role === 'user' ? 'flex m-4 w-3/4 ml-auto' : 'flex m-4 w-3/4'"
        />
      </div>
    </div>
    <div class="fixed bottom-0 left-0 footer bg-base-300 p-4 w-full h-36">
      <div class="flex flex-col w-full">
        <div class="flex w-full flex-row">
          <textarea v-model="message" class="textarea grow" placeholder="Enter your message." @keyup="checkEnter" />
          <button
            v-if="!isSending"
            type="submit"
            class="btn btn-primary my-auto flex items-center ml-4"
            @click.prevent="onSubmit"
          >
            Send
          </button>
          <div v-if="isSending" class="flex w-12 h-12 ml-8 my-auto">
            <span class="loading loading-dots loading-md"></span>
          </div>
        </div>
        <div v-if="sendErrorMessage" class="my-1 ml-4 text-red-500">{{ sendErrorMessage }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
});
const { messages, createMessage, refreshMessages, deleteMessage } = useMessages();
import { CognitoUserPool, CognitoUserSession } from "amazon-cognito-identity-js";

const currentSession = ref<CognitoUserSession | null>(null);
const nuxtApp = useNuxtApp();
const userPool = nuxtApp.$userPool as CognitoUserPool;
const cognitoUser = userPool.getCurrentUser();
if (cognitoUser) {
  cognitoUser.getSession(function (err, session) {
    if (err) {
      return;
    }
    if (session && session.isValid()) {
      currentSession.value = session;
    } else {
      currentSession.value = null;
    }
  });
} else {
  currentSession.value = null;
}

const message = ref("");
const sendErrorMessage = ref("");
const isClearing = ref(false);
const isSending = ref(false);

const onSubmit = () => {
  const trimmed = message.value.trim();
  if (!trimmed) {
    sendErrorMessage.value = "Empty message. Please enter any message.";
    return;
  }
  sendMessage(trimmed);
};

const checkEnter = (event: { key: string; shiftKey: any; preventDefault: () => void }) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    const trimmed = message.value.trim();
    if (trimmed) {
      sendMessage(trimmed);
    }
  }
};

const sendMessage = async (msg: string) => {
  if (!currentSession.value) {
    navigateTo("/login");
    return;
  }
  sendErrorMessage.value = "";
  isSending.value = true;
  const { error } = await createMessage(currentSession.value, {
    content: msg
  });
  if (error) {
    sendErrorMessage.value = error.toString();
    isSending.value = false;
    return;
  }
  message.value = "";
  isSending.value = false;
};

const onClear = async () => {
  if (!currentSession.value) {
    navigateTo("/login");
    return;
  }
  isClearing.value = true;
  await deleteMessage(currentSession.value);
  isClearing.value = false;
};

const onLogout = async () => {
  if (cognitoUser) {
    cognitoUser.signOut();
  }
  navigateTo("/login");
};

if (currentSession.value) {
  refreshMessages(currentSession.value);
}
</script>
