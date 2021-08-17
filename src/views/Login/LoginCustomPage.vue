<template>
	 <div class="table-container main">
		<div class="rows">
			<div class="cells">
				<input type="text" name="usename" autocomplete="off"
					id="username" v-on:click="renderKeyBoard($event)" class="input-boxes"/>
			</div>
		</div>
		<div class="rows">
			<div class="cells">
				<input type="password" name="password" 
					v-on:click="renderKeyBoard($event)" class="input-boxes"/>
			</div>
		</div>
		<div id="keyboard" v-bind:key="k" v-for="k in keys">
			<button class="key-btn">{{k}}</button>
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
      focusInput: null
    };
  },
	methods: {
		renderKeyBoard(e: any) {
			//console.log(e.currentTarget);
			console.log(this.$props.inputs)
		},
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

.table-container {
  display: table;
  width: 96.5%;
  text-align: center;
  margin-top: 10%;
}

.rows {
  display: table-row;
  line-height: 120px;
}

.cells {
  display: table-cell;
}
</style>
