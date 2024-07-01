import { ulid } from "ulid";
import { Message } from "~/types/message";
import { MessageCreateDto } from "~/types/message_create_dto";
import { getUserIdFromHeaders } from "../utils/tokenUtils";

export default defineEventHandler(async (event) => {
  const userId = await getUserIdFromHeaders(event.headers);
  if (!userId) {
    return createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }

  const body = (await readBody(event)) as MessageCreateDto;
  if (!body || !body.content) {
    return createError({
      statusCode: 400,
      message: "Bad Request"
    });
  }
  const newUserMessage: Message = {
    id: ulid(),
    content: body.content,
    role: "user",
    createdAt: Date.now()
  };
  const newAssistantMessage: Message = {
    id: ulid(),
    content: body.content,
    role: "assistant",
    createdAt: Date.now()
  };
  const storage = useStorage();
  const storageId = `messages_${userId}`;
  const messages = (await storage.getItem<Message[]>(storageId)) || [];
  messages.push(newUserMessage, newAssistantMessage);
  await storage.setItem(storageId, messages);
  return [newUserMessage, newAssistantMessage];
});
