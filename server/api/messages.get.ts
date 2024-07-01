import { Message } from "yup";

export default defineEventHandler(async (event) => {
  const messages = await getMessages("");
  return messages;
});

const getMessages = async (userId: string): Promise<Message[]> => {
  const storage = useStorage();
  const messages = (await storage.getItem<Message[]>("messages")) || [];
  return messages;
};
