<template >
  <ion-page style="background-color: #fff">
    <img class="loader" :src="'/assets/images/loading.gif'">
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import JsBarcode from "jsbarcode";
import { alertConfirmation, toastSuccess, toastWarning } from "@/utils/Alerts";
import { Patientservice } from "@/services/patient_service";

export default defineComponent({
  data() {
    return {
      toastMessage: "",
    };
  },
  async mounted() 
  {
    await this.checkingDeviceType();
   
    const patientID: any = this.$route.params.patient_id
    const data = await Patientservice.findByID(patientID);
    const identfier =data.patient_identifiers.filter(function (el: any){return el.identifier_type == 3;});
    const patientIdentfier = identfier[0].identifier;
    const patientName = data.person.names[0].given_name+ "  "+data.person.names[0].family_name;
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, patientIdentfier, {format: "CODE128"});
    const img =canvas.toDataURL("image/png");
    const canvas2 = document.createElement('canvas');
    const ctx: any = canvas2.getContext("2d"); 
    const router = this.$router

    function convertToBase64(){
      BluetoothSerial.list(
        function(addresResults: any) {
          let loopBreaker = false;
          for(const x in addresResults){
            BluetoothSerial.printImage(addresResults[x].address, canvas2.toDataURL("image/png"), 
            function(printerResults: any){
              loopBreaker = true;
              console.log(JSON.stringify(printerResults));
              toastSuccess("Printed Succefully to "+ addresResults[x].name).then(()=>{
                router.push('/triage');
              });
            }, 
            function(printerError: any){ 
              console.log(JSON.stringify(printerError));
              toastWarning("Fail to Print to "+addresResults[x].name).then(()=>{
                if((addresResults.length)-1 == parseInt(x))
                router.push('/triage');
              });
            });
            if(loopBreaker)
            break;
          }
        },
        function(error: any) {
          console.log(JSON.stringify(error));
          toastWarning("No paired device found").then(()=>{
                router.push('/triage');
              });
        }
      )
    }

    const image = new Image();
    image.onload = function() {
      canvas2.width = 320;
      canvas2.height = 250; 
      ctx.drawImage(image, 20, 60, 250, 100);
      ctx.font = `20px "Tahoma"`;
      ctx.fillText(patientName,20,50);
      convertToBase64();
    };
    image.src = img;
  },
  methods:{
    goHome(){
      toastWarning(this.toastMessage).then(()=>{
          this.$router.push('/triage');
      });
    },
    checkingDeviceType(){
      if(document.getElementsByClassName("plt-desktop").length == 1){
        this.toastMessage = "Printing using desktop is underdevelopment";
        this.goHome();
      }else{
        this.checkingBlutoothConnection();
      }
    },
    checkingBlutoothConnection(){
      const router = this.$router
      BluetoothSerial.list(async function(addresResults: any) {
      if(addresResults.length < 1){
        const confirmation = await alertConfirmation("Would you like to try again ?  (Please check if bluetooth is on before trying again)", {
                confirmBtnLabel: 'Yes',
                cancelBtnLabel: 'No',
                header: 'No paired devices'
            });
      if (confirmation) 
        location.reload(); 
      else
        router.push('/triage');
      }
      },function(this: any,printerError: any) {
        alert(JSON.stringify(printerError))
      });
    }
  }

});
</script>
<style scoped>
.loader{
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  top:30%;
  left: 0;
  right: 0;
  text-align: center;
}

</style>
