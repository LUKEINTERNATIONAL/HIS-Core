<template>
	 <div class="main" ref="main">
		<div class="rows">
			<div class="cells">
				<input type="text" name="usename" autocomplete="off"
					id="username" v-on:click="renderKeyBoard($event)" class="input-boxes"/>
			</div>
		</div>
		<div class="rows input-rows">
			<div class="cells">
				<input type="password" name="password" ref="password" id="password"
					v-on:click="renderKeyBoard($event)" class="input-boxes"/>
			</div>
		</div>
		<div id="keyboard" :style="btnStyles" class="keyboard">
			<span v-bind:key="k" v-for="k in keys">
			<div class="rows">
				<div class="cells" v-bind:key="r" v-for="r in k">
					<button v-if="r === 'Next' || r === 'Login'" :id="btnCaption" class="keyboard-btn login-btn" v-on:click="keyPress($event)">{{btnCaption}}</button>
					<button v-if="r != 'Login' && r != 'Next'" :id="r" class="keyboard-btn" v-on:click="keyPress($event)">{{r}}</button>
				</div>
			</div>
			</span>
		</div>
	</div>
</template>

<script lang="ts">
import ApiClient from "@/services/api_client";
import { toastWarning } from "@/utils/Alerts";

export default {
	props: ["keys"],
  data: function() {
    return {
      userInput: {
				type: String,
				username: '',
				password: ''
			},
      focusInput: {
				type: Object,
				value: '',
				id: ''
			},
			display: 'none',
			keyboardLeft: '',
			keyboardTop: '',
			btnCaption: '',
			passwordInput: this.$refs.password
    };
  }/*,
	computed: {
    computedDisplay(): string {
      return this.display;
    }
  }*/,
	methods: {
		renderKeyBoard(e: any) {
		this.focusInput = e.currentTarget;
		this.focusInput.id == 'password' ? this.btnCaption = 'Login' : this.btnCaption = 'Next';

			const main = document.getElementsByClassName("main")[0];
      const width = main.getBoundingClientRect().width;
      //const divPos = ((50 / width)*100);
      let inputPos = e.currentTarget.getBoundingClientRect().top;
      inputPos = parseInt(inputPos);

      this.keyboardLeft = ((width / 2) - 447) + "px;";
			this.keyboardTop = (inputPos + 77) + "px;";
			this.display = "table";		
		},
		keyPress(e: any){
			const key = e.currentTarget.id;

			try{
				if(key.match(/Del./i)){
					this.focusInput.value = this.focusInput.value.substring(0, this.focusInput.value.length - 1);
				}else if(key.match(/Next/i)){
					this.display = "none";
					let elem: any;
					elem = this.$refs.password;
    			elem.click()
				}else if(key.match(/Login/i)){
					this.display = "none";
					this.doLogin();
				}else if(key.match(/Caps/i)){
				}else if(key.match(/Hide/i)){
					this.display = "none";
				}else{
					this.focusInput.value += key;
				}
				
				this.focusInput.id == 'username' ? this.userInput.username = this.focusInput.value : 
					this.userInput.password = this.focusInput.value;
			}catch(x) { }
		},
		doLogin: async function () {

      if (this.userInput.username && this.userInput.password) {
        const params = {
          username: this.userInput.username,
          password: this.userInput.password,
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
    }
	},
	computed: {
    btnStyles(): string {
      return `display: ${this.display}; left: ${this.keyboardLeft} top: ${this.keyboardTop}`;
    }
  }
};
</script>


<style scoped>
.input-boxes {
  height: 70px;
  /*width: 50%;*/

  border: 1px solid #ccc;
  border-radius: 5px;
  width: calc(100% - 500px);
  font-family: Nimbus Sans L,Arial Narrow,sans-serif;
  font-size: 2.2em;
  background-color: #dcdcdc;
  color: #000;
  padding: 8px;
}

.main {
  width: 96.5%;
  text-align: center;
  margin-top: 5%;
  display: table;
}

.keyboard {
	z-index: 40; 
	/*width: auto;*/
	position: absolute;
	background-color: white;
	width: 50%;
	margin: auto;
	background-color: rgba(255, 255, 255, 0.9);
	border: 1px solid rgb(204, 204, 204);
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
  font-size: 25px !important;
  font-family: arial, helvetica, sans-serif;
  padding: 10px 10px 10px 10px;
  text-decoration: none;
  display: inline-block;
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #fff;
  background-color: #a7cfdf;
  background-image: -webkit-gradient(linear, left top, left bottom, from(#a7cfdf), to(#23538a));
  background-image: -webkit-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -moz-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -ms-linear-gradient(top, #a7cfdf, #23538a);
  background-image: -o-linear-gradient(top, #a7cfdf, #23538a);
  background-image: linear-gradient(to bottom, #a7cfdf, #23538a);
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr=#a7cfdf, endColorstr=#23538a);
  min-width: 85px;
  min-height: 85px;
  cursor: pointer;
  /*width: 84px;
  height: 35px; */
  text-align: center;
  margin: 3px;
}
.login-btn {
	background-image: -webkit-gradient(linear, left top, left bottom, from(green), to green);
  background-image: -webkit-linear-gradient(top,green, green);
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
