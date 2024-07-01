import { CognitoUserPool } from "amazon-cognito-identity-js";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

  const poolData = {
    UserPoolId: runtimeConfig.public.cognitoUserPoolId as string,
    ClientId: runtimeConfig.public.cognitoClientId as string
  };

  const userPool = new CognitoUserPool(poolData);
  nuxtApp.provide("userPool", userPool);
});
