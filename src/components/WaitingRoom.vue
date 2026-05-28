<template>
  <div class="waiting-room">
    <div class="waiting-room-header"></div>
    <div class="waiting-card">
      <div class="waiting-header">
        <img src="/assets/logo.png" alt="Logo" class="waiting-logo" />
        <h1 class="waiting-title">{{ room.name }}</h1>
      </div>

      <div class="waiting-status">
        <span class="status-dot closed"></span>
        <span class="status-text">This room is currently closed</span>
      </div>

      <div v-if="scheduleInfo.nextOpen" class="waiting-next">
        <p class="next-label">Opens {{ scheduleInfo.nextOpen.label }} at {{ scheduleInfo.nextOpen.time }}</p>
        <div class="countdown">{{ countdown }}</div>
      </div>

      <div v-else class="waiting-next">
        <p class="next-label">No upcoming sessions scheduled</p>
      </div>

      <div v-if="room.description" class="waiting-description">
        <h3>Agenda</h3>
        <p>{{ room.description }}</p>
      </div>

      <div v-if="room.waiting_iframe" class="waiting-iframe-container">
        <iframe
          :src="room.waiting_iframe"
          class="waiting-iframe"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { checkSchedule, formatCountdown } from '../utils/schedule.js';

export default {
  name: 'WaitingRoom',
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      now: Date.now(),
      timer: null,
    };
  },
  computed: {
    scheduleInfo() {
      return checkSchedule(this.room.schedule);
    },
    countdown() {
      if (!this.scheduleInfo.nextOpen) return '';
      // Reference this.now to ensure reactivity on each tick
      void this.now;
      return formatCountdown(this.scheduleInfo.nextOpen.minutesUntil);
    },
  },
  watch: {
    'scheduleInfo.isOpen'(val) {
      if (val) {
        this.$emit('room-opened');
      }
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
};
</script>

<style scoped>
.waiting-room-header {
  position: fixed;
  top: 0;
  left: 0;
  height: 50px;
  width: 100%;
  background: #212533;
  z-index: 10000;
}

.waiting-room {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: rgba(32, 42, 54, 1);
  padding: 70px 20px 20px;
}

.waiting-card {
  background: rgba(40, 52, 68, 1);
  border-radius: 12px;
  padding: 40px;
  max-width: 560px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.waiting-header {
  margin-bottom: 30px;
}

.waiting-logo {
  height: 48px;
  margin-bottom: 16px;
}

.waiting-title {
  color: #f1f1f1;
  font-size: 1.6em;
  margin: 0;
}

.waiting-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.closed {
  background-color: #ff5555;
}

.status-text {
  color: #aab;
  font-size: 1.1em;
}

.waiting-next {
  margin-bottom: 28px;
}

.next-label {
  color: #ccd;
  font-size: 1em;
  margin: 0 0 12px 0;
}

.countdown {
  color: #5bc0de;
  font-size: 2.4em;
  font-weight: 700;
  letter-spacing: 2px;
}

.waiting-description {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
  text-align: left;
}

.waiting-description h3 {
  color: #dde;
  margin: 0 0 8px 0;
  font-size: 1em;
}

.waiting-description p {
  color: #aab;
  margin: 0;
  line-height: 1.5;
}

.waiting-iframe-container {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.waiting-iframe {
  width: 100%;
  min-height: 400px;
  border: none;
}

@media (max-width: 600px) {
  .waiting-card {
    padding: 24px 16px;
  }

  .waiting-title {
    font-size: 1.2em;
  }

  .countdown {
    font-size: 1.8em;
  }

  .waiting-iframe {
    min-height: 300px;
  }
}
</style>
