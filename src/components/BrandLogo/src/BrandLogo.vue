<script lang="ts" setup>
import logoUrl from '@/assets/imgs/antian-logo.png'

defineProps<{ markOnly?: boolean }>()
</script>

<template>
  <!-- 仅在显示时去掉原图的透明留白，保留原始 Logo 像素。 -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="markOnly ? '10 23 31 23' : '10 23 103 23'"
    role="img"
    aria-label="安天智能物流"
    focusable="false"
  >
    <image :href="logoUrl" width="122" height="73" />
  </svg>
</template>
