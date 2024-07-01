import type { Message } from "~/types/message";
import type { MessageCreateDto } from "~/types/message_create_dto";
import { CognitoUserSession } from "amazon-cognito-identity-js";

export type CreateMessageResult = {
  messages: Message[];
  error: Error | null;
};

export const useMessages = () => {
  const messages = useState<Message[]>("messages", () => []);
  const refreshMessages = async (session: CognitoUserSession) => {
    const url = "/api/messages";
    const idToken = session.getIdToken().getJwtToken();
    const { data, error } = await useFetch<Message[]>(url, { headers: { Authorization: `Bearer ${idToken}` } });
    if (!error.value && data.value) {
      messages.value = data.value;
    }
  };
  const createMessage = async (session: CognitoUserSession, dto: MessageCreateDto): Promise<CreateMessageResult> => {
    const url = "/api/messages";
    const idToken = session.getIdToken().getJwtToken();
    const { data, error } = await useFetch<Message[]>(url, {
      method: "post",
      headers: { Authorization: `Bearer ${idToken}` },
      body: dto
    });
    let newMessages: Message[] = [];
    if (!error.value && data.value) {
      newMessages = [...data.value];
      const prevMessages = messages.value;
      messages.value = [...prevMessages, ...newMessages];
    }
    return {
      messages: newMessages,
      error: error.value
    };
  };
  const deleteMessage = async (session: CognitoUserSession) => {
    const url = "/api/messages";
    const idToken = session.getIdToken().getJwtToken();
    const { error } = await useFetch(url, { method: "delete", headers: { Authorization: `Bearer ${idToken}` } });
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
