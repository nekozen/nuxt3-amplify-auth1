export default defineEventHandler(async (event) => {
  const storage = useStorage();
  await storage.setItem("messages", []);
});
