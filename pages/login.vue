<template>
  <div>
    <div class="navbar bg-green-700 h-16">
      <div class="m-auto text-lg text-white">Echo Bot</div>
    </div>
    <form @submit.prevent="onSubmit" class="mx-48 py-8">
      <div class="mb-8 mx-auto text-lg text-center">Login</div>
      <div v-if="useVerificationCode" class="my-1 ml-4 text-red-500 text-center">Password has been reset.</div>
      <div v-if="needsUpdatePassword" class="my-1 ml-4 text-red-500 text-center">Set new password.</div>
      <label class="input input-bordered flex items-center my-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70 mx-4">
          <path
            d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
          />
          <path
            d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
          />
        </svg>
        <input type="text" class="grow" name="email" placeholder="Email" v-model="email" />
      </label>
      <div v-if="useVerificationCode">
        <label class="input input-bordered flex items-center my-4">
          <input
            type="text"
            class="grow"
            name="verificationCode"
            placeholder="Verification Code"
            v-model="verificationCode"
          />
        </label>
      </div>
      <label class="input input-bordered flex items-center my-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70 mx-4">
          <path
            fill-rule="evenodd"
            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
            clip-rule="evenodd"
          />
        </svg>
        <input v-if="!useNewPassword" type="password" name="password" class="grow" v-model="password" />
        <input v-if="useNewPassword" type="password" class="grow" v-model="newPassword" />
      </label>
      <div class="my-4 w-48 mx-auto">
        <label class="label cursor-pointer">
          <span class="label-text text-right">Use reset code</span>
          <input type="checkbox" class="checkbox checkbox-primary" v-model="useVerificationCode" />
        </label>
      </div>
      <div v-if="isSending" class="w-24 h-24 mx-auto text-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="text-center mt-8">
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
      <div v-if="errorMessage" class="mt-4 text-red-500 text-center">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { CognitoUser, AuthenticationDetails, CognitoUserPool } from "amazon-cognito-identity-js";
const email = ref("");
const password = ref("");
const newPassword = ref("");
const showNewPasswordInput = ref(false);
const errorMessage = ref("");
const verificationCode = ref("");
const needsUpdatePassword = ref(false);
const useVerificationCode = ref(false);
const useNewPassword = computed(() => {
  return needsUpdatePassword.value || useVerificationCode.value;
});
const isSending = ref(false);

const nuxtApp = useNuxtApp();
const userPool = nuxtApp.$userPool as CognitoUserPool;
const cognitoUser = userPool.getCurrentUser();

if (cognitoUser) {
  cognitoUser.getSession(function (err, session) {
    if (err) {
      console.error("Error retrieving session:", err);
      return;
    }

    if (session && session.isValid()) {
      return navigateTo("/");
    } else {
      console.log("Session is not valid or expired.");
      return;
    }
  });
} else {
  console.log("User is not logged in.");
}

const onSubmit = () => {
  errorMessage.value = "";
  isSending.value = true;

  const userData = {
    Username: email.value,
    Pool: userPool
  };
  const cognitoUser = new CognitoUser(userData);

  if (useVerificationCode.value) {
    // 認証後にリセットされる情報を退避
    cognitoUser.confirmPassword(verificationCode.value, newPassword.value, {
      onSuccess() {
        console.log("Password reset successfully");
        useVerificationCode.value = false;
        verificationCode.value = "";
        authenticateUser(cognitoUser, email.value, newPassword.value);
      },
      onFailure(err) {
        errorMessage.value = "Wrong verification code or password.";
        console.error("Error:", err);
        isSending.value = false;
      }
    });
  } else if (needsUpdatePassword.value) {
    authenticateUser(cognitoUser, email.value, password.value, newPassword.value);
  } else {
    authenticateUser(cognitoUser, email.value, password.value);
  }
};

const authenticateUser = async (
  cognitoUser: CognitoUser,
  authEmail: string,
  authPassword: string,
  authNewPassword?: string
) => {
  const authenticationData = {
    Username: authEmail,
    Password: authPassword
  };
  const authenticationDetails = new AuthenticationDetails(authenticationData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function () {
      email.value = "";
      password.value = "";
      newPassword.value = "";
      isSending.value = false;
      navigateTo("/");
    },
    newPasswordRequired: function (userAttributes, requiredAttributes) {
      if (authNewPassword) {
        cognitoUser.completeNewPasswordChallenge(
          authNewPassword,
          {},
          {
            onSuccess: function () {
              needsUpdatePassword.value = false;
              isSending.value = false;
              navigateTo("/");
            },
            onFailure: function (err) {
              errorMessage.value = "Invalid password.";
              console.log("Error:", err);
              isSending.value = false;
            }
          }
        );
      } else {
        needsUpdatePassword.value = true;
        isSending.value = false;
      }
    },
    onFailure: function (err) {
      if (err.code === "PasswordResetRequiredException") {
        useVerificationCode.value = true;
        isSending.value = false;
        return;
      }
      errorMessage.value = "Wrong email or password.";
      console.log("Error:", err);
      isSending.value = false;
    }
  });
};
</script>
