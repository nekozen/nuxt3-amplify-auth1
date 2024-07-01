import { getTokenFromHeader, getUserIdFromHeaders } from "../utils/tokenUtils";

export default defineEventHandler(async (event) => {
  const userId = await getUserIdFromHeaders(event.headers);
  if (!userId) {
    return createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }
  const storage = useStorage();
  const storageId = `messages_${userId}`;
  await storage.setItem(storageId, []);
});
