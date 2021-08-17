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
  data: function() {
    return {
      username: null,
      password: null,
      focusInput: null
    };
  },
	props: ["inputs"],
  methods: {
    renderKeyBoard(e: any) {
      this.showKeyboard(e.currentTarget);
    }, showKeyboard(e: any) {
      const keyboard = document.createElement("div");
      keyboard.setAttribute("id","keyboard");

      const main = document.getElementsByClassName("main")[0];
      const width = main.getBoundingClientRect().width;
      //const divPos = ((50 / width)*100);
      let inputPos = e.getBoundingClientRect().top;
      inputPos = parseInt(inputPos);

      let styles = "left: " + ((width / 2) - 320) + "px;top: " + (inputPos + 77) + "px;";
      styles += "z-index: 40; border-radius: 25px; width: auto;"
      keyboard.setAttribute("style", styles);
      main.appendChild(keyboard);

      this.focusInput = e;
      this.keyboardKeys(keyboard);
    }, keyboardKeys(e: any) {
      const keypress = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["q","w","e","r","t","y","u","i","o","p"],
        ["a","s","d","f","g","h","j","k","l","Del."],
        ["z","x","c","v","b","n","m", "Hide","Caps"]
      ];

      const table = document.createElement("div");
      table.setAttribute("class","keyboard-table");

      for(const k of keypress){
        const row = document.createElement("div")
        row.setAttribute("class","keyboard-table-row");
        table.appendChild(row);

        for(const x of k){
          const cell = document.createElement("div")
          cell.setAttribute("class","keyboard-table-cell");
          row.appendChild(cell);

          const span = document.createElement("span")
          span.setAttribute("class","keyboard-span");
          span.setAttribute("onclick","keyPressed(this);");
          if(x == "Hide")
            span.setAttribute("onclick","hideKeyboard();");

            span.innerHTML = x;
            cell.appendChild(span);
        }
      }
      e.appendChild(table);
    }, hideKeyboard(){
      const keyboard = document.getElementById("keyboard");
      console.log(keyboard);
      //keyboard.setAttribute("style","display: none;");
    }
  }
};
</script>


<style scope>

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

#keyboard {
  height: 265px;
  width: 910px;
  bottom: 10px;
  left: calc(50vw - 350px);
  background-color: rgba(255, 255, 255, 0.9);
  position: absolute;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px !important;
  z-index: 100;
  text-align: center;
  display: block;
}

.keyboard-table {
  display: table;
  width: 100%;
  margin: 10px 10px 10px 0px;
}

.keyboard-table-row {
  display: block;
}

.keyboard-table-cell {
  display: inline-block;
}

.keyboard-span {
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

</style>
