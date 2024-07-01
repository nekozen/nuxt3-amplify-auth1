import { CognitoJwtVerifier } from "aws-jwt-verify";

export const getUserIdFromHeaders = async (headers: Headers): Promise<string> => {
  const authHeader = headers.get("authorization");
  const token = getTokenFromHeader(authHeader);
  const userId = await getUserIdFromToken(token);
  return userId;
};

const getUserIdFromToken = async (bearerToken: string): Promise<string> => {
  let userId = "";
  const config = useRuntimeConfig();
  const verifier = CognitoJwtVerifier.create({
    userPoolId: config.public.cognitoUserPoolId,
    tokenUse: null,
    clientId: config.public.cognitoClientId
  });
  try {
    const payload = await verifier.verify(bearerToken);
    userId = payload.sub;
  } catch (err) {
    console.log(`invalid token: err=${JSON.stringify(err)}`);
  }
  return userId;
};

export const getTokenFromHeader = (authHeader: string | null): string => {
  if (!authHeader) {
    return "";
  }
  const bearerRegex = /^Bearer\s+(.+)$/i;
  const match = authHeader.match(bearerRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "";
};
