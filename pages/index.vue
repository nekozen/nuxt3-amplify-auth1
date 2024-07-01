<template>
  <div class="flex flex-col min-h-screen">
    <div class="navbar bg-green-700 fixed top-0 left-0 z-50 h-16">
      <div class="m-auto text-lg text-white">Echo Bot</div>
      <button
        type="submit"
        class="btn btn-outline my-auto flex items-center mr-2 text-white"
        @click.prevent="onClear"
        :disabled="isClearing"
      >
        Clear
      </button>
    </div>
    <div class="mt-16 mb-36 w-full" ref="messageContainer">
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
          <button type="submit" class="btn btn-primary my-auto flex items-center ml-4" @click.prevent="onSubmit">
            Send
          </button>
        </div>
        <div v-if="sendErrorMessage" class="my-1 ml-4 text-red-500">{{ sendErrorMessage }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { messages, createMessage, refreshMessages, deleteMessage } = useMessages();
const message = ref("");
const sendErrorMessage = ref("");
let isClearing = ref(false);

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
  sendErrorMessage.value = "";
  const { error } = await createMessage({
    content: msg
  });
  if (error) {
    sendErrorMessage.value = error.toString();
    return;
  }
  message.value = "";
};

const onClear = async () => {
  isClearing.value = true;
  await deleteMessage();
  isClearing.value = false;
};

refreshMessages();

const messageContainer: Ref<null | HTMLDivElement> = ref(null);
</script>
