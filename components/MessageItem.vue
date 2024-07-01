<template>
  <div
    :class="role === 'user' ? 'card card-compact bg-slate-100 shadow-xl' : 'card card-compact bg-cyan-100 shadow-xl'"
  >
    <div class="card-body whitespace-pre">
      {{ content }}
    </div>
    <div class="text-right text-gray-400 text-sm my-2 mr-4">{{ formattedDate }}</div>
  </div>
</template>
<script setup lang="ts">
import { format } from "date-fns";

type Props = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};
const props = defineProps<Props>();
const formattedDate = format(props.createdAt, "M/d HH:mm");
</script>
