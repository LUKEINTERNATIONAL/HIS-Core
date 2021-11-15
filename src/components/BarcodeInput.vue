<template>
  <ion-row>
    <ion-col size="2">
      <img id="barcode-img" src="/assets/images/barcode.svg"/>
    </ion-col>
    <ion-col size="10">
      <input ref="barcode" :autofocus="true" id="barcode-inputbox" v-model="barcodeText"/>
    </ion-col>
  </ion-row>
</template>

<script>
import { defineComponent } from 'vue';
import {IonCol,IonRow} from "@ionic/vue";

export default defineComponent({
  name: 'BarcodeInput',
  components: {
    IonRow,
    IonCol,
  },
  props: ['clearValue'],
  data: () => ({
    barcodeText: ''
  }),
  mounted() {
    setInterval(() => {
      try {
        this.$refs.barcode.focus()
      } catch(e) {
        //No focus
      }
    }, 1500)
  },
  methods: {
    checkForbarcode(){
        if(this.barcodeText.match(/.+\$$/i) != null){
          const text = this.barcodeText.replace(/\$/ig, '');
          this.$emit('onScan', text)
          this.barcodeText = ''
        }
    }
  },
  watch: {
    clearValue() {
      this.barcodeText = ''
    },
    barcodeText: function(text) {
      if (text) {
        this.checkForbarcode();
        this.$emit('onValue', text)
      }
    }
  }
});
</script>
<style scoped>
input:focus { 
    outline: none !important;
    border-color: #719ECE;
    box-shadow: 0 0 5px #202020;
}
#barcode-img {
  width: 70%;
}
#barcode-inputbox {
  font-weight: bold;
  padding: 5px;
  font-size: 2.9em;
  border-style: solid;
  border-width: 0px 0px 2px 0px;
  border-color: #ccc;
  background-color: white;
  width: 100%;
  height: 90%;
}
@media (min-width: 200px) and (max-width: 900px) { 
  #barcode-img {
    width: 350px;
  }
}
</style>
