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
	</div>
</template>

<script lang="ts">
export default {
	props: ["inputs"],
  data: function() {
    return {
      username: null,
      password: null,
      focusInput: null
    };
  },
	methods: {
		renderKeyBoard(e: any) {
			console.log(e.currentTarget);
		},
	}
};
</script>


<style scope>


</style>
