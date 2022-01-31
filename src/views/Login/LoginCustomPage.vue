<template>
  <div class="main" ref="main">
    <div class="rows">
      <div class="cells">
        <input
          type="text"
          name="usename"
          autocomplete="off"
          placeholder="Username"
          id="username"
          ref="username"
          v-model="userInput.username"
          v-on:click="renderKeyBoard($event)"
          class="input-boxes"
          :readonly="isReadOnly"
        />
      </div>
    </div>
    <div class="rows input-rows">
      <div class="cells">
        <input
          v-model="userInput.password"
          type="password"
          name="password"
          ref="password"
          id="password"
          v-on:click="renderKeyBoard($event)"
          class="input-boxes"
          placeholder="Password"
          :readonly="isReadOnly"
        />
      </div>
    </div>
  </div>
  <center>
  <div id="keyboard" :style="btnStyles"  class="keyboard">
    <span v-bind:key="k" v-for="k in LOGIN_KEYBOARD">
      <div class="rows">
        <div class="cells" v-bind:key="r" v-for="r in k">
          <button
            v-if="r === 'Next' || r === 'Login'"
            :id="btnCaption"
            class="keyboard-btn login-btn"
            v-on:click="keyPress($event)"
          >
            {{ btnCaption }}
          </button>

          <button
            v-if="r != 'Login' && r != 'Next'"
            :id="Caps.on ? r.toUpperCase() : r.toLowerCase()"
            class="keyboard-btn"
            v-on:click="keyPress($event)"
          >
            {{
              r === "Del." || r === "Caps"
                ? r
                : Caps.on
                ? r.toUpperCase()
                : r.toLowerCase()
            }}
          </button>
        </div>
      </div>
    </span>
  </div>
  </center>
</template>

<script lang="ts">
import { toastWarning, toastDanger } from "@/utils/Alerts";
import { defineComponent } from 'vue';
import { AuthService, InvalidCredentialsError } from "@/services/auth_service"
import { isPlatform } from "@ionic/vue"
import { LOGIN_KEYBOARD } from "@/components/Keyboard/KbLayouts"

export default defineComponent({
  data: function () {
    return {
      LOGIN_KEYBOARD: LOGIN_KEYBOARD,
      auth: {} as any,
      isReadOnly: false as boolean,
      userInput: {
        type: String,
        username: "",
        password: "",
      },
      focusInput: {
        type: Object,
        value: "",
        id: "",
      },
      display: "none",
      keyboardLeft: "",
      keyboardTop: "",
      btnCaption: "",
      Caps: {
        type: Boolean,
        on: false,
      },
    };
  }, 
  created() {
    this.auth = new AuthService()
    this.isReadOnly = !isPlatform('desktop')
  },
  methods: {
    renderKeyBoard(e: any) {
      this.focusInput = e.currentTarget;
      this.focusInput.id == "password"
        ? (this.btnCaption = "Login")
        : (this.btnCaption = "Next");

      const main = document.getElementsByClassName("main")[0];
      const width = main.getBoundingClientRect().width;
      let inputPos = e.currentTarget.getBoundingClientRect().top;
      inputPos = parseInt(inputPos);

      this.keyboardLeft = width / 2 - 447 + "px;";
      this.keyboardTop = inputPos + 20 + "px;";
      this.display = "table";
      window.scrollTo(0,9999);
    },
    keyPress(e: any) {
      const key = e.currentTarget.id;
      let elem: any;

      try {
        if (key.match(/Del./i)) {
          this.focusInput.value = this.focusInput.value.substring(
            0,
            this.focusInput.value.length - 1
          );
        } else if (key.match(/Next/i)) {
          this.display = "none";
          elem = this.$refs.password;
          elem.click();
        } else if (key.match(/Login/i)) {
          this.display = "none";
          this.doLogin();
        } else if (key.match(/Caps/i)) {
          this.Caps.on = this.Caps.on ? false : true;
          this.display = "none";
          if (this.focusInput.id === "username") {
            elem = this.$refs.username;
          } else {
            elem = this.$refs.password;
          }
          elem.click();
        } else if (key.match(/Hide/i)) {
          this.display = "none";
        } else {
          this.focusInput.value += key;
        }

        this.focusInput.id == "username"
          ? (this.userInput.username = this.focusInput.value)
          : (this.userInput.password = this.focusInput.value);
      } catch (x) {
        console.warn('input error')
      }
    },
    doLogin: async function () {
      if (this.userInput.username && this.userInput.password) {
        this.auth.setUsername(this.userInput.username)
        try {
          await this.auth.login(this.userInput.password)
          this.auth.startSession()
          this.$router.push("/select_hc_location");
        } catch (e) {
          if (e instanceof InvalidCredentialsError ) {
            toastWarning("Invalid username or password");
          } else {
            toastDanger(e)
          }
        }
      } else {
        toastWarning("Complete form to log in");
      }
    }
  },
  computed: {
    btnStyles(): string {
      return `display: ${this.display}; top: ${this.keyboardTop}`;
    },
  },
});
</script>


<style scoped>
.input-boxes {
  height: 70px;
  /*width: 50%;*/

  border: 1px solid #ccc;
  border-radius: 5px;
  width: 50%;
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 2.2em;
  background-color: #dcdcdc;
  color: #000;
  padding: 8px;
}

.main {
  width: 100%;
  text-align: center;
  margin-top: 5%;
  display: table;
}

.keyboard {
  text-align: center;
  position: absolute;
  background-color: white;
  width: 56%;
  margin: auto;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgb(204, 204, 204);
  word-wrap: normal !important;
  left: 0; 
  right: 0; 
  margin-left: auto; 
  margin-right: auto; 
  max-width: 300px;
}

.rows {
  display: table-row;
  line-height: 1px;
}

.cells {
  display: table-cell;
}

.keyboard-btn {
  border: 1px solid #7eb9d0;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 5px !important;
  font-size: 1.6vw !important;
  font-family: arial, helvetica, sans-serif;
  /* padding: 10px 10px 10px 10px; */
  text-decoration: none;
  display: inline-block;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #fff;
  background-color: #a7cfdf;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#a7cfdf),
    to(#23538a)
  );
  background-image: -webkit-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -moz-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -ms-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -o-linear-gradient(top, #a7cfdf, #23538a);
  background-image: linear-gradient(to bottom, #a7cfdf, #23538a);
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=#a7cfdf, endColorstr=#23538a);
  max-width: 85px;
  max-height: 85px;
  cursor: pointer;
  /*width: 84px;
  height: 35px; */
  text-align: center;
  margin: 3px;
  width: 8vw;
  height: 8vh;
  /* text-overflow: ellipsis; */
  overflow: hidden;
  white-space: nowrap;

}
@media screen and (max-width: 600px){
    .keyboard-btn {
        font-size: 10px !important;
    }
}
@media screen and (min-width: 1020px){
    .keyboard-btn {
        font-size: 25px !important;
    }
}
.login-btn {
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(green),
    to green
  );
  background-image: -webkit-linear-gradient(top, green, green);
  background-image: -moz-linear-gradient(top, green, green);
  background-image: -ms-linear-gradient(top, green, green);
  background-image: -o-linear-gradient(top, green, green);
  background-image: linear-gradient(to bottom, green, green);
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=green, endColorstr=green);
}

.input-rows {
  line-height: 140px;
}
</style>