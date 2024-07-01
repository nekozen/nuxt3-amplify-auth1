import { ulid } from "ulid";
import { Message } from "~/types/message";
import { MessageCreateDto } from "~/types/message_create_dto";

export default defineEventHandler(async (event) => {
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
  const messages = (await storage.getItem<Message[]>("messages")) || [];
  messages.push(newUserMessage, newAssistantMessage);

  await storage.setItem("messages", messages);

  return [newUserMessage, newAssistantMessage];
});
