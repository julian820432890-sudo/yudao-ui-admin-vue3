<script lang="ts" setup>
import logisticsScene from '@/assets/imgs/login-logistics-scene.png'
import { useAppStore } from '@/store/modules/app'
import { BrandLogo } from '@/components/BrandLogo'

const appStore = useAppStore()
const { t } = useI18n()
</script>

<template>
  <aside class="login-showcase" :aria-label="t('login.showcase.label')">
    <div class="login-showcase__grid" aria-hidden="true"></div>
    <div class="login-showcase__halo" aria-hidden="true"></div>

    <header class="login-showcase__brand">
      <BrandLogo mark-only class="h-48px w-48px shrink-0" />
      <span>{{ appStore.getTitle }}</span>
    </header>

    <div class="login-showcase__content">
      <div class="login-showcase__eyebrow">
        <span aria-hidden="true"></span>
        ANTIAN / LOGISTICS INTELLIGENCE
      </div>
      <h1 class="login-showcase__headline">
        {{ t('login.showcase.headline') }}
        <span>{{ t('login.showcase.highlight') }}</span>
      </h1>
      <p class="login-showcase__welcome">{{ t('login.welcome') }}</p>

      <div class="login-showcase__scene">
        <div class="login-showcase__scene-glow" aria-hidden="true"></div>
        <img
          class="login-showcase__image"
          :src="logisticsScene"
          :alt="t('login.showcase.imageAlt')"
          width="1536"
          height="1024"
          fetchpriority="high"
          decoding="async"
        />
        <svg class="login-showcase__flow" viewBox="0 0 640 420" fill="none" aria-hidden="true">
          <path d="M32 264C57 392 482 432 599 277" />
          <path d="M68 123C220 16 506 35 591 156" />
        </svg>

        <div class="login-showcase__card login-showcase__card--dispatch">
          <div class="login-showcase__card-icon" aria-hidden="true">AI</div>
          <div>
            <strong>{{ t('login.showcase.dispatch') }}</strong>
            <span>{{ t('login.showcase.dispatchHint') }}</span>
          </div>
          <i class="login-showcase__signal" aria-hidden="true"></i>
        </div>

        <div class="login-showcase__card login-showcase__card--connect">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="m7 9 18 14M7 23 25 9M7 9v14M25 9v14" />
            <circle cx="7" cy="9" r="3" />
            <circle cx="25" cy="9" r="3" />
            <circle cx="7" cy="23" r="3" />
            <circle cx="25" cy="23" r="3" />
          </svg>
          <div>
            <strong>{{ t('login.showcase.collaboration') }}</strong>
            <span>{{ t('login.showcase.collaborationHint') }}</span>
          </div>
        </div>
      </div>

      <footer class="login-showcase__features">
        <div>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m13 3-8 11h6l-1 7 9-12h-6l1-6Z" />
          </svg>
          <span>{{ t('login.showcase.smart') }}</span>
        </div>
        <div>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <ellipse cx="12" cy="12" rx="4" ry="9" />
            <path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" />
          </svg>
          <span>{{ t('login.showcase.global') }}</span>
        </div>
        <div>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{{ t('login.showcase.visible') }}</span>
        </div>
      </footer>
      <div class="login-showcase__signature" aria-hidden="true">
        <span>INTELLIGENCE IN MOTION</span>
        <span class="login-showcase__signature-line"></span>
        <span>ANTIAN</span>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.login-showcase {
  position: relative;
  display: none;
  min-width: 0;
  padding: 30px 38px 28px;
  overflow: hidden;
  color: #f4f8ff;
  isolation: isolate;
  background: #060f20;
  flex: 1;
  flex-direction: column;

  @media (width >= 1280px) {
    display: flex;
  }

  &::after {
    position: absolute;
    z-index: -1;
    pointer-events: none;
    background:
      radial-gradient(ellipse at 55% 53%, rgb(14 105 148 / 16%), transparent 67%),
      linear-gradient(145deg, rgb(30 63 107 / 16%), transparent 45%);
    content: '';
    inset: 0;
  }

  &__grid {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background-image:
      linear-gradient(rgb(105 169 218 / 5%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(105 169 218 / 5%) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: linear-gradient(135deg, #000, transparent 48%, #000);
  }

  &__halo {
    position: absolute;
    top: -330px;
    right: -260px;
    z-index: -1;
    width: 700px;
    height: 700px;
    pointer-events: none;
    border: 1px solid rgb(92 182 237 / 9%);
    border-radius: 50%;

    &::before,
    &::after {
      position: absolute;
      border: 1px solid rgb(92 182 237 / 7%);
      border-radius: 50%;
      content: '';
      inset: 50px;
    }

    &::after {
      inset: 100px;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;

    span {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  }

  &__content {
    position: relative;
    display: flex;
    width: 100%;
    max-width: 720px;
    min-height: 0;
    margin: clamp(30px, 6vh, 80px) auto 0;
    flex: 1;
    flex-direction: column;
  }

  &__eyebrow {
    display: flex;
    font-family: Consolas, monospace;
    font-size: 10px;
    line-height: 20px;
    letter-spacing: 2.2px;
    color: #80c4e6;
    align-items: center;
    gap: 10px;

    span {
      width: 6px;
      height: 6px;
      background: #42dfff;
      border-radius: 50%;
      box-shadow: 0 0 12px rgb(66 223 255 / 80%);
      animation: showcase-pulse 4s ease-in-out infinite;
    }
  }

  &__headline {
    margin: 15px 0 13px;
    font-size: clamp(38px, 3.3vw, 58px);
    font-weight: 750;
    line-height: 1.25;
    letter-spacing: 3px;

    span {
      display: block;
      width: fit-content;
      margin-top: 4px;
      color: #62dfff;
      background: linear-gradient(100deg, #e0fbff, #5ce1ff 52%, #3983ff);
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  &__welcome {
    margin: 0;
    font-size: 13px;
    line-height: 24px;
    letter-spacing: 1px;
    color: #a4b8d1;
  }

  &__scene {
    position: relative;
    display: flex;
    min-height: 280px;
    margin: 6px -20px 2px;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  &__scene-glow {
    position: absolute;
    inset: 15% 10%;
    pointer-events: none;
    background: radial-gradient(ellipse, rgb(0 167 238 / 14%), transparent 68%);
    animation: showcase-pulse 7s ease-in-out infinite;
  }

  &__image {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    max-height: 520px;
    object-fit: contain;
    user-select: none;
    mask-image:
      linear-gradient(transparent, #000 9%, #000 91%, transparent),
      linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
    mask-composite: intersect;
    mix-blend-mode: screen;
  }

  &__flow {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    stroke: #76edff;
    stroke-dasharray: 3 140;
    stroke-linecap: round;
    stroke-width: 2;
    filter: drop-shadow(0 0 4px #00cfff);
    animation: showcase-flow 14s linear infinite;
  }

  &__card {
    position: absolute;
    display: flex;
    padding: 13px 15px;
    align-items: center;
    gap: 11px;
    background: linear-gradient(120deg, rgb(16 40 62 / 86%), rgb(9 26 47 / 78%));
    border: 1px solid rgb(117 202 247 / 24%);
    border-radius: 12px;
    box-shadow:
      0 12px 40px rgb(0 0 0 / 22%),
      inset 0 1px rgb(220 248 255 / 7%);
    backdrop-filter: blur(12px);
    animation: showcase-float 7s ease-in-out infinite;

    strong {
      display: block;
      font-size: 12px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.5px;
      color: #e9f8ff;
    }

    span {
      display: block;
      font-size: 10px;
      line-height: 16px;
      color: #81a5be;
    }

    &--dispatch {
      top: 4%;
      left: 4%;
    }

    &--connect {
      right: 1%;
      bottom: 8%;
      animation-delay: -3.5s;

      svg {
        width: 30px;
        height: 30px;
        stroke: #53d8f6;
        stroke-width: 1.3;
      }
    }
  }

  &__card-icon {
    display: grid;
    width: 32px;
    height: 34px;
    font-family: Consolas, monospace;
    font-size: 16px;
    font-weight: 700;
    color: #72e6ff;
    background: rgb(35 159 221 / 13%);
    border: 1px solid rgb(91 211 255 / 23%);
    border-radius: 8px;
    place-items: center;
  }

  &__signal {
    width: 5px;
    height: 5px;
    margin-left: 6px;
    background: #69f2cf;
    border-radius: 50%;
    box-shadow: 0 0 9px rgb(105 242 207 / 50%);
  }

  &__features {
    display: grid;
    padding-top: 22px;
    margin-top: 12px;
    border-top: 1px solid rgb(129 180 220 / 15%);
    gap: 12px;
    grid-template-columns: repeat(3, 1fr);

    div {
      display: flex;
      font-size: 12px;
      letter-spacing: 1px;
      color: #b8cde2;
      align-items: center;
      gap: 9px;
    }

    svg {
      width: 19px;
      height: 19px;
      stroke: #68c7ed;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.3;
      flex-shrink: 0;
    }
  }

  &__signature {
    display: flex;
    margin-top: 25px;
    font-family: Consolas, monospace;
    font-size: 9px;
    line-height: 16px;
    letter-spacing: 1.8px;
    color: #526d8a;
    align-items: center;
    gap: 14px;
  }

  &__signature-line {
    height: 1px;
    background: linear-gradient(90deg, rgb(108 163 204 / 24%), transparent);
    flex: 1;
  }
}

@keyframes showcase-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-7px);
  }
}

@keyframes showcase-pulse {
  0%,
  100% {
    opacity: 0.65;
  }

  50% {
    opacity: 1;
  }
}

@keyframes showcase-flow {
  to {
    stroke-dashoffset: -1144;
  }
}

@media (height <= 780px) and (width >= 1280px) {
  .login-showcase {
    padding-top: 24px;
    padding-bottom: 20px;

    &__content {
      margin-top: 24px;
    }

    &__headline {
      margin-top: 8px;
      font-size: 38px;
    }

    &__scene {
      min-height: 240px;
    }

    &__signature {
      margin-top: 14px;
    }

    &__features {
      padding-top: 16px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-showcase *,
  .login-showcase *::before,
  .login-showcase *::after {
    animation: none !important;
  }
}
</style>
