<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row>
          <ion-col>
            <ion-text>
              <span id="emr-title">
                <span id="emr-title-one">National </span>
                <!-- <br> -->
                <span id="emr-title-two">EMR</span>
                <span id="version-desc">Series 3</span>
              </span>
            </ion-text>
          </ion-col>
          <ion-col>
            <ion-button style="float: right" router-link="/settings/host" v-if="showConfig()">
              Configuration
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" :fullscreen="true">
      <ion-row>
        <ion-col>
          <form novalidate>
            <ion-list class="get-centered">
              <ion-item>
                <ion-input
                  v-model="username"
                  name="username"
                  ref="username"
                  type="text"
                  spellcheck="false"
                  autocapitalize="off"
                  required
                  class="login_input"
                  placeholder="Username"
                  @ionFocus="focusKeyboard('username')"
                ></ion-input>
              </ion-item>
              <!-- TODO: make this info message for when login was attempted without username entered. -->
              <ion-text color="danger">
                <p v-show="!validateUsername" padding-left>Username is required</p>
              </ion-text>

              <ion-item>
                <ion-input
                  ref="password"
                  v-model="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  @ionFocus="focusKeyboard('password')"
                  class="login_input"
                >
                </ion-input>
              </ion-item>
              <!-- TODO: make this info message for when login was attempted without password entered. -->
              <ion-text color="danger">
                <p v-show="!validatePassword" padding-left>Password is required</p>
              </ion-text>
            </ion-list>
          </form>
        </ion-col>
      </ion-row>

      <keyboard
        @inputChar="enterChar"
        :val="getVal"
        v-if="active"
        :custom="customButton"
        @doLogin="doLogin"
        :position="currentHeight"
        @nextEvent="goToNextField"
      >
      </keyboard>
    </ion-content>
    <ion-footer>
      <span class="logos" id="coat">
        <img
          id="coat-of-arms"
          src="/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png"
          alt="Malawi Coat of Arms logo"
        />
      </span>
      <span class="logos" id="pepfar">
        <img
          class="other-logos"
          src="/assets/images/login-logos/PEPFAR.png"
          alt="PEPFAR logo"
        />
      </span>
    </ion-footer>

    <!-- <ion-footer>
    <ion-toolbar>
      Footer
    </ion-toolbar>
  </ion-footer> -->
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonInput,
  IonList,
  IonRow,
  IonCol,
  IonItem,
  IonText,
  IonFooter,
  IonToolbar,
  IonHeader,
  IonPage,
  IonButton,
  toastController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { toastWarning } from "@/utils/Alerts"
import keyboard from "../../components/Keyboard/qwerty.vue";
import ApiClient from "@/services/api_client"
export default defineComponent({
  // emits: ['input-char'],
  name: "Home",
  components: {
    IonList,
    IonRow,
    IonCol,
    IonItem,
    IonButton,
    IonInput,
    IonContent,
    IonPage,
    IonText,
    IonFooter,
    IonToolbar,
    IonHeader,
    keyboard,
  },
 data() {
    return {
      username: "",
      password: "",
      active: "",
      busy: false,
      submitted: false,
      usernameValid: false,
      passwordValid: false,
      minUsernameLength: 4,
      minPasswordLength: 4,
      customButton: {
        name: "login",
        action: "doLogin",
      },
      currentHeight: null,
    };
  },
  computed: {
    validateUsername() {
      if (!this.username || this.username.length < this.minUsernameLength) {
        return false;
      }
      return true;
    },
    validatePassword() {
      if (!this.password || this.password.length < this.minPasswordLength) {
        return false;
      }
      return true;
    },
    getVal(): any {
      if (this.active === "username") {
        return this.username;
      } else {
        return this.password;
      }
    },
  },
  mounted() {
    sessionStorage.clear();
  },
  methods: {
    focusKeyboard(e: string) {
      const child: any = this.$refs[e];
      const top = child.$el.getBoundingClientRect().top;
      this.currentHeight = top;
      this.active = e;
    },
    enterChar(e: string) {
      if (this.active === "username") {
        this.username = e;
      } else {
        this.password = e;
      }
    },
    getActive(): string {
      if (this.active === "username") {
        return this.username;
      } else {
        return this.password;
      }
    },
    showConfig(): boolean {
      if(localStorage.getItem('useLocalStorage') === 'true')  return true 
      return false
    },

    goToNextField() {
      const nextField = this.active === "username" ? "password" : "username";
      this.focusKeyboard(nextField);
    },
    doLogin: async function () {
      this.busy = true;

      if (this.validateUsername && this.validatePassword) {
        const params = {
          username: this.username.toLowerCase(),
          password: this.password.toLowerCase(),
        };
        const response = await ApiClient.post(
          "auth/login",
          params
        ).catch((error) => {
          console.log(error);
        });
        if (response) {
          if (response.status === 200) {
           const {
          authorization: { token, user }
        } = await response.json();
        sessionStorage.setItem("apiKey", token);
        sessionStorage.setItem("username", user.username);
        sessionStorage.setItem("userID", user.user_id);
        sessionStorage.setItem("userRoles", JSON.stringify(user.roles));
        this.$router.push("/select_hc_location");
          } else if (response.status === 401) {
            toastWarning("Invalid username or password");
          } else {
            toastWarning("An error has occured");
            console.warn(`Response: ${response.status} - ${response.body}`);
          }
        }
      }
      else {
        toastWarning("Complete form to log in");
      }
      this.busy = false;
    },
  },
  onLogin(ev: any) {
    ev.preventDefault();
  },
});
</script>

<style scoped>
ion-footer {
  background-color: white;
}
ion-input {
  margin: 5%;
}
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}
#coat {
  /* position: fixed; */
  /* bottom: 0; */
  /* left: 0; */
  float: left;
}

#pepfar {
  /* position: fixed; */
  /* bottom: 0; */
  /* right: 0; */
  float: right;
}
#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}

.main {
  display: table;
  width: 100%;
  border: 1px solid black;
  height: 97vh;
  /*background-image: url("/assets/images/login-logos/Malawi-Coat_of_arms_of_arms.png");
  background-repeat: no-repeat;
  background-position: center;*/
}

.get-centered {
  text-align: center;
}

.logos img {
  width: 90px;
  height: 90px;
  margin-left: 10px;
  float: left;
}

.login-logo img {
  max-width: 150px;
}

.list {
  margin-bottom: 0;
}

#emr-title {
  font-size: 60px;
  font-weight: bold;
  color: #bdb5aa;
  padding-bottom: 8px;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  /* text-transform: uppercase; */
}

#emr-title-one {
  color: #8b4513;
}

#emr-title-two {
  color: #cd853f;
}

#version-desc {
  font-size: 15px;
  margin-left: 5px;
}

.login_input {
  border: 1px solid #ccc;
  border-radius: 5px;
  width: calc(100% - 30px);
  font-family: Nimbus Sans L, Arial Narrow, sans-serif;
  font-size: 2.2em;
  background-color: lightgrey;
  color: #000;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #8b4513;
  border-radius: 5px;
}


</style>