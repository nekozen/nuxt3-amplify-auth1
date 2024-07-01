import type { Message } from "~/types/message";
import type { MessageCreateDto } from "~/types/message_create_dto";

export type CreateMessageResult = {
  messages: Message[];
  error: Error | null;
};

export const useMessages = () => {
  const messages = useState<Message[]>("messages", () => []);
  const refreshMessages = async () => {
    const url = "/api/messages";
    const { data, error } = await useFetch<Message[]>(url);
    if (!error.value && data.value) {
      messages.value = data.value;
    }
  };
  const createMessage = async (dto: MessageCreateDto): Promise<CreateMessageResult> => {
    const url = "/api/messages";
    const { data, error } = await useFetch<Message[]>(url, { method: "post", body: dto });
    let newMessages: Message[] = [];
    if (!error.value && data.value) {
      newMessages = [...data.value];
      const prevMessages = messages.value;
      messages.value = [...prevMessages, ...newMessages];

      console.log(`createMessage: message=${messages.value}`);
    }
    return {
      messages: newMessages,
      error: error.value
    };
  };
  const deleteMessage = async () => {
    const url = "/api/messages";
    const { error } = await useFetch(url, { method: "delete" });
    let newMessages: Message[] = [];
    if (!error.value) {
      messages.value = [];
    }
  };
  return {
    messages,
    refreshMessages,
    createMessage,
    deleteMessage
  };
};
