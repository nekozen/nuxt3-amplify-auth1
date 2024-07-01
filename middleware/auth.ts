import { CognitoUserPool } from "amazon-cognito-identity-js";

export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp();
  const userPool = nuxtApp.$userPool as CognitoUserPool;
  const cognitoUser = userPool.getCurrentUser();

  if (cognitoUser) {
    cognitoUser.getSession(function (err: any, session: { isValid: () => any }) {
      if (err) {
        console.error("Error retrieving session:", err);
        return navigateTo("/login");
      }

      if (session.isValid()) {
        console.log("User has a valid session");
        return;
      } else {
        console.log("User's session has expired");
        return navigateTo("/login");
      }
    });
  } else {
    console.log("User doesn't have a valid session");
    return navigateTo("/login");
  }
});
