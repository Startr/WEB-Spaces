<template>
  <div>
    <WaitingRoom v-if="thisRooms && !isRoomOpen" :room="thisRooms" @room-opened="onRoomOpened" />
    <div v-else-if="$route.params && thisRooms" id="content">
      <!-- Username Modal -->
      <div v-if="showNameModal" class="name-modal-backdrop">
        <div class="name-modal-content">
          <h2>Enter your display name</h2>
          <p>This name will be visible to others in the meeting.</p>
          <input
            type="text"
            v-model="nameInput"
            placeholder="Your name"
            class="name-input"
            maxlength="50"
            @keyup.enter="saveName"
            autofocus
          />
          <button class="name-save-btn" @click="saveName">Join</button>
        </div>
      </div>
      <div id="header">
        <span class="connState"></span>
        <!--<button id="start-togetherjs" type="button"
          onclick="TogetherJS(this); return false"
          data-end-togetherjs-html="End TogetherJS">
          Start TogetherJS
        </button>-->
        <div id="save"></div>

        <div id="logo">
          <img
            src="/assets/logo.png"
            alt="Logo"
            style="padding: 6px; margin-left: 60px"
            id="logoImg"
          />
        </div>
        <h1>{{ thisRooms.name }}</h1>

        <div class="modal-container">
          <input
            id="modal-toggle"
            type="checkbox"
            v-model="thisRooms.checked"
          />
          <button>Onload Info</button>
          <div class="modal-backdrop">
            <div class="modal-content">
              <label class="modal-close" for="modal-toggle">x</label>
              <h1>{{ thisRooms.name }}</h1>
              <div>
                <h2>{{ thisRooms.alt }}</h2>
                <h2>{{ thisRooms.meet }}</h2>
                <h3>{{ thisRooms.salt }}</h3>
              </div>
              <label class="modal-close button" for="modal-toggle">Close</label>
            </div>
          </div>
        </div>
        <div style="display: none">
          <input
            type="radio"
            name="app_state"
            value="assets/show-window.svg"
            checked="checked"
          />
          <input type="radio" name="app_state" value="assets/fullscreen.svg" />
          <input
            type="radio"
            name="app_state"
            value="assets/close-window.svg"
          />
        </div>
        <div id="open" style="right: 1%; position: fixed">
          <a class="user-icon-btn" @click="openNameModal" title="Change display name">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f1f1f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="height: 28px; width: 28px; cursor: pointer;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </a>
          <a>
            <img
              class="brightness"
              onclick="openWindowSide()"
              src="/assets/show-window.svg"
              style="height: 36px"
              id="app_opener"
            />
          </a>
          <a
            @click.prevent="switchRoom(null, $event)"
            href="#"
            class="dot"
            style="background-color: #ff5555"
            id="dot1"
          >
            <img src="/assets/home.svg" />
          </a>
          <a
            v-for="n in thisRooms.classroom.breakout_rooms"
            v-bind:key="n"
            @click.prevent="switchRoom(n, $event)"
            href="#"
            class="dot"
          >
            <span>{{ n }}</span>
          </a>
          <a
            class="dot support"
            target="_blank"
            onclick=""
            href="https://wbo.ophir.dev/boards/FtsL-vNceb-IA-H93os4RKIkbS2of0wIK18cdMggPbs-"
          >
            <span>?</span>
          </a>
        </div>
      </div>
      <div id="myModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content">
          <p>Faites tourner votre portable.</p>
          <img src="/assets/rotate-phone.svg" />
          <p>Please rotate your device.</p>
        </div>
      </div>
      <div class="window">
        <iframe
          style="width: 0%; height: calc(100% - 50px); border: none"
          src="https://wbo.ophir.dev/boards/Startr-Space-Shared-Meeting-Room-Whiteboard-"
          id="faq"
          name="faq_iframe"
        ></iframe>
        <template
          v-if="thisRooms.classroom.app_set[0].name == 'Shared Whiteboard'"
        >
          <iframe
            allow="microphone; camera"
            :src="
              thisRooms.classroom.app_set[0].iframe +
              thisRooms.name.split('/')[0]
            "
            id="apps"
            name="app_iframe"
            class="Close"
          ></iframe>
        </template>
        <template v-else>
          <iframe
            allow="microphone; camera"
            :src="thisRooms.classroom.app_set[0].iframe"
            id="apps"
            name="app_iframe"
            class="Close"
          ></iframe>
        </template>
        <div id="jitsi" class="Open"></div>
      </div>
    </div>
  </div>
</template>
<script>
import WaitingRoom from '../../components/WaitingRoom.vue';
import { checkSchedule } from '../../utils/schedule.js';

export default {
  name: "meet",
  title: "Hall",
  components: { WaitingRoom },
  created: function () {
    //Populate empty meeting
  },
  data: function () {
    return {
      app: "",
      config: {},
      now: Date.now(),
      scheduleTimer: null,
      displayName: localStorage.getItem('spaces-display-name') || '',
      nameInput: '',
      showNameModal: false,
      jitsiApi: null,
      jitsiScriptLoaded: false,
    };
  },
  computed: {
    params: function () {
      if (!this.$route.params.meet) {
        return {
          meet: "Foyer - Lobby",
          alt: "Foyer - Lobby",
          name: "Foyer - Lobby",
          title: "Hall",
          frameposition: 0,
          breakout_rooms: 1,
        };
      } else {
        return this.$route.params;
      }
    },
    app_set: function () {
      if (!this.$route.params.app_set) {
        return [
          {
            name: "FAQ",
            logo:
              "",
            iframe: "",
          },
        ];
      } else {
        return this.$route.params.app_set;
      }
    },
    meetingRooms: function () {
      return parseInt(this.params.breakout_rooms);
    },
    thisRooms: function () {
      return this.$parent.rooms.find(
        (room) => room.meet == this.$route.params.meet
      );
    },
    jitsiDomain: function () {
      if (!this.thisRooms) return '';
      try {
        var url = new URL(this.thisRooms.classroom.platform.domain);
        return url.hostname;
      } catch (e) {
        return '';
      }
    },
    jitsiRoomName: function () {
      if (!this.thisRooms) return '';
      try {
        var url = new URL(this.thisRooms.classroom.platform.domain);
        var pathPrefix = url.pathname.replace(/^\//, '').replace(/\/$/, '');
        var room = this.thisRooms.meet + this.thisRooms.salt;
        return pathPrefix ? pathPrefix + '/' + room : room;
      } catch (e) {
        return this.thisRooms.meet + this.thisRooms.salt;
      }
    },
    isRoomOpen: function () {
      if (!this.thisRooms || !this.thisRooms.schedule) return true;
      // Reference this.now to ensure reactivity
      void this.now;
      return checkSchedule(this.thisRooms.schedule).isOpen;
    },
  },
  watch: {
    thisRooms: function () {
      if (!this.jitsiScriptLoaded) {
        this.loadJitsiScript();
      }
      this.tryInitJitsi();
    },
    isRoomOpen: function (newVal) {
      if (newVal) {
        this.tryInitJitsi();
      }
    },
  },
  mounted: function () {
    this.scheduleTimer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
    if (!this.displayName) {
      this.nameInput = '';
      this.showNameModal = true;
    }
    this.loadJitsiScript();
  },
  beforeDestroy: function () {
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }
    this.disposeJitsi();
  },
  methods: {
    onRoomOpened: function () {
      this.now = Date.now();
    },
    saveName: function () {
      var trimmed = this.nameInput.trim();
      if (trimmed) {
        this.displayName = trimmed;
        localStorage.setItem('spaces-display-name', trimmed);
        this.showNameModal = false;
        if (this.jitsiApi) {
          // Update display name in the live meeting without reloading
          this.jitsiApi.executeCommand('displayName', trimmed);
        } else {
          this.tryInitJitsi();
        }
      }
    },
    openNameModal: function () {
      this.nameInput = this.displayName;
      this.showNameModal = true;
    },
    loadJitsiScript: function () {
      if (this.jitsiScriptLoaded || !this.jitsiDomain) return;
      if (window.JitsiMeetExternalAPI) {
        this.jitsiScriptLoaded = true;
        this.tryInitJitsi();
        return;
      }
      var self = this;
      var script = document.createElement('script');
      script.src = 'https://' + this.jitsiDomain + '/external_api.js';
      script.onload = function () {
        self.jitsiScriptLoaded = true;
        self.tryInitJitsi();
      };
      document.head.appendChild(script);
    },
    tryInitJitsi: function () {
      if (!this.jitsiScriptLoaded || this.jitsiApi || !this.thisRooms || !this.isRoomOpen) return;
      var self = this;
      this.$nextTick(function () {
        var container = document.querySelector('#jitsi');
        if (container) {
          self.initJitsi();
        }
      });
    },
    initJitsi: function (roomName) {
      this.disposeJitsi();
      var container = document.querySelector('#jitsi');
      if (!container || !this.jitsiDomain) return;
      this.jitsiApi = new window.JitsiMeetExternalAPI(this.jitsiDomain, {
        roomName: roomName || this.jitsiRoomName,
        parentNode: container,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName: this.displayName || undefined,
        },
        configOverwrite: {
          requireDisplayName: false,
          startAudioMuted: 6,
          disableAudioLevels: true,
          disableDeepLinking: true,
          prejoinConfig: { enabled: false },
          toolbarButtons: [
            'camera',
            'chat',
            'closedcaptions',
            'desktop',
            'download',
            'embedmeeting',
            'etherpad',
            'feedback',
            'filmstrip',
            'fullscreen',
            'hangup',
            'help',
            'highlight',
            'invite',
            'livestreaming',
            'microphone',
            'noisesuppression',
            'profile',
            'raisehand',
            'recording',
            'security',
            'select-background',
            'settings',
            'shareaudio',
            'sharedvideo',
            'shortcuts',
            'stats',
            'tileview',
            'toggle-camera',
            'videoquality',
            'whiteboard',
            // 'participants-pane' intentionally hidden
          ],
        },
        interfaceConfigOverwrite: {
          DISABLE_VIDEO_BACKGROUND: true,
          SHOW_CHROME_EXTENSION_BANNER: false,
        },
      });
    },
    disposeJitsi: function () {
      if (this.jitsiApi) {
        this.jitsiApi.dispose();
        this.jitsiApi = null;
      }
    },
    switchRoom: function (breakoutNumber, event) {
      // Handle active dot styling (replaces global breakout() function)
      var dots = document.getElementsByClassName('dot');
      Array.from(dots).forEach(function (e) { e.classList.remove('active'); });
      if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
      }
      // Switch Jitsi room
      var roomName = this.jitsiRoomName;
      if (breakoutNumber) {
        roomName += '-breakout-room-' + breakoutNumber;
      }
      this.initJitsi(roomName);
    },
  },
};
</script>

<style>
/* Jitsi IFrame API container - unscoped to target dynamically created iframe */
#jitsi iframe {
  border: none !important;
}
</style>

<style scoped>
a {
  color: #444499;
  text-decoration: none;
}

a:hover {
  color: #333;
}

#header {
  position: fixed;
  top: 0;
  left: 0px;
  height: 50px;
  width: 100%;
  background: #212533;
  padding: 0;
  z-index: 10000;
}

#header img {
  max-width: 80%;
}

#apps {
  background-color: white;
}

#logo {
    display: inline;
    position: absolute;
    left: 0px;
    height: 100%;
  }

  #logo img {
    height: 100%;
  }

h1 {
  margin-top: 5px;
  padding-top: 5px;
  color: #f1f1f1;
  font-size: 1.6em;
}

@media (max-width: 991px) {
  h1 {
    padding-top: 10px;
    font-size: 1em;
  }
}

.modal-container {
  margin: 0 auto;
  padding-top: 10px;
  position: relative;
  width: 160px;
}

.modal-container button {
  display: none;
  margin: 0 auto;
  color: #fff;
  width: 160px;
  height: 50px;
  line-height: 50px;
  background: #446cb3;
  font-size: 22px;
  border: 0;
  border-radius: 3px;
  box-shadow: 0 5px 5px -5px #333;
  transition: background 0.3s ease-in;
}

.modal-container .modal-backdrop {
  height: 0;
  width: 0;
  opacity: 0;
  overflow: hidden;
  transition: opacity 0.2s ease-in;
}

.modal-container #modal-toggle {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.modal-container #modal-toggle:hover ~ button {
  background: #1e824c;
}

.modal-container #modal-toggle:checked {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9;
  opacity: 0;
}

.modal-container #modal-toggle:checked ~ .modal-backdrop {
  background-color: rgba(0, 0, 0, 0.6);
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9;
  pointer-events: none;
  opacity: 1;
}

.modal-container #modal-toggle:checked ~ .modal-backdrop .modal-content {
  background-color: #fff;
  max-width: 400px;
  width: 100%;
  height: 280px;
  padding: 10px 30px;
  position: absolute;
  left: calc(50% - 200px);
  top: 12%;
  border-radius: 4px;
  z-index: 99999;
  pointer-events: auto;
  cursor: auto;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.6);
}
@media (max-width: 400px) {
  .modal-container #modal-toggle:checked ~ .modal-backdrop .modal-content {
    left: 0;
  }
}

.modal-container
  #modal-toggle:checked
  ~ .modal-backdrop
  .modal-content
  .modal-close {
  color: #666;
  position: absolute;
  right: 2px;
  top: 0;
  padding-top: 7px;
  background: #fff;
  font-size: 16px;
  width: 25px;
  height: 28px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
}

.modal-container
  #modal-toggle:checked
  ~ .modal-backdrop
  .modal-content
  .modal-close.button {
  top: initial;
  bottom: 20px;
  right: 20px;
  background: #4caf50;
  color: #fff;
  width: 50px;
  border-radius: 2px;
  font-size: 14px;
  font-weight: normal;
}

.modal-container
  #modal-toggle:checked
  ~ .modal-backdrop
  .modal-content
  .modal-close.button:hover {
  color: #fff;
  background: #1e824c;
}

.modal-container
  #modal-toggle:checked
  .modal-backdrop
  .modal-content
  .modal-close:hover {
  color: #333;
}

.window {
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  background: rgba(32, 42, 54, 1);
}

#apps,
#jitsi {
  height: calc(100vh - 45px);
  border: none;
  margin: none;
  padding: none;
  top: 50px;
  left: 0px;
}

.Open {
  width: 100vw;
}
.Half {
  width: 50vw;
}
.Close {
  width: 0vw;
}

#open {
  /* position: fixed; */
  top: 5px;
  right: 1vw;
  z-index: 99999;
  display: flex;
}

.dot {
  height: 28px;
  min-width: 28px;
  font-weight: 600;
  /* background-color: #bbb; */
  border-radius: 50%;
  /* display: inline-block; */
  margin-left: 25px;
  border: 3px solid #f1f1f1;
  text-align: center;
  color: white;
  background-color: transparent;
}

@media (max-width: 991px) {
  .dot {
    height: 27px;
    margin-left: 5px;
  }
}

.dot.active {
  background-color: lime !important;
}
.dot:hover {
  background-color: #bbb !important;
}
.dot > * {
  /* vertical-align: bottom; */
  line-height: 25px;
  font-size: larger;
  font-weight: inherit;
}
.dot > img {
  height: 18px;
  /* vertical-align:baseline; */
  margin-top: 3px;
}
/* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 999999; /* Sit on top */
  padding-top: 2vh; /* Location of the box */
  padding-bottom: 2vh; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  min-height: 88%;
  font-size: 3rem;
}

.modal-content > img {
  height: fit-content;
  padding: 2em;
}

.rotate {
  transform: rotate(-90deg) translate(-100%, 0%);
}
@media screen and (orientation: portrait) and (hover: none) and (pointer: coarse) {
  .modal {
    display: block;
  }
}

/* Username Modal */
.name-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name-modal-content {
  background: rgba(40, 52, 68, 1);
  border-radius: 12px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.name-modal-content h2 {
  color: #f1f1f1;
  font-size: 1.4em;
  margin: 0 0 12px 0;
}

.name-modal-content p {
  color: #aab;
  font-size: 0.95em;
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.name-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1.1em;
  font-family: 'Varela Round', sans-serif;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #f1f1f1;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.name-input:focus {
  border-color: #4caf50;
}

.name-input::placeholder {
  color: rgba(241, 241, 241, 0.3);
}

.name-save-btn {
  width: 100%;
  padding: 12px;
  font-size: 1.1em;
  font-family: 'Varela Round', sans-serif;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.name-save-btn:hover {
  background: #1e824c;
}

/* User icon in header */
.user-icon-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 10px;
}

.user-icon-btn:hover svg {
  stroke: #4caf50;
}
</style>
