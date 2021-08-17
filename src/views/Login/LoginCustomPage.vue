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
				<input type="password" name="password" 
					v-on:click="renderKeyBoard($event)" class="input-boxes"/>
			</div>
		</div>
		<div id="keyboard" :style="btnStyles" class="keyboard" v-bind:key="k" v-for="k in keys">
			<div class="rows">
				<div class="cells" v-bind:key="r" v-for="r in k">
					<button class="keyboard-btn">{{r}}</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default {
	props: ["keys"],
  data: function() {
    return {
      username: null,
      password: null,
      focusInput: null,
			display: 'none',
			keyboardLeft: ''
    };
  }/*,
	computed: {
    computedDisplay(): string {
      return this.display;
    }
  }*/,
	methods: {
		renderKeyBoard(e: any) {
			//console.log(e.currentTarget);

			const main = document.getElementsByClassName("main")[0];
      const width = main.getBoundingClientRect().width;
      //const divPos = ((50 / width)*100);
      let inputPos = e.getBoundingClientRect().top;
      inputPos = parseInt(inputPos);

      this.keyboardLeft = ((width / 2) - 320) + "px;top: " + (inputPos + 77) + "px;";
			this.display = "table";
		}
	},
	computed: {
    btnStyles(): string {
      return `display: ${this.display};`;
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
  margin-top: 10%;
  display: table;
}

.keyboard {
	z-index: 40; 
	border-radius: 25px; 
	width: auto;
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
  min-width: 60px;
  min-height: 55px;
  cursor: pointer;
  /*width: 84px;*/
  height: 35px;
  text-align: center;
  margin: 3px;
}

.input-rows {
	line-height: 140px;
}
</style>
