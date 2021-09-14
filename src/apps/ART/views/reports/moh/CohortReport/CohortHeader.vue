<template>
  <table>
    <tr id="version-row">
      <td class="numbers">&nbsp;</td>
      <td colspan="4" id="version">Version 26</td>
    </tr>
    <tr>
      <td class="numbers">1.</td>
      <td class="row-title" style="border-right-style: solid; border-bottom: 0px !important; font-weight: bold;">Clinic name</td>
      <td class="row-title" colspan="3" style="border-bottom-style: solid;">{{clinicName}}</td>
    </tr>
    <tr>
      <td class="numbers">2.</td>
      <td class="row-title" style="border: 0px !important; ">Supervisors</td>
      <td class="row-name" style="font-weight: bold;">Name</td>
      <td colspan="2" class="signatures" style="font-weight: bold;">Signature</td>
    </tr>
    <tr v-for="sign in items" :key="sign">
      <td class="numbers">{{sign}}</td>
      <td class="row-title no-borders">&nbsp;</td>
      <td class="row-name name-left">&nbsp;</td>
      <td colspan="2" class="signatures">&nbsp;</td>
    </tr>
    <tr>
      <td class="numbers">10.</td>
      <td class="row-title" style="border-bottom-style: solid; border-top-style: none;">Quarter evaluated</td>
      <td class="row-name name-left" style="border-bottom-style: solid;">Year:&nbsp;<b>{{quarterYr}}</b></td>
      <td colspan="2" class="signatures" style="border-bottom-style: solid;">Quarter:&nbsp;<b>{{quarterStr}}</b></td>
    </tr>
  </table>
</template>

<script>
export default {
  props: {
    clinicName: {
      type: String,
      default: ''
    },
    reportparams: {
      type: Object,
      required: true
    }
  },
  data: function(){
    return {
      items: ['3.','4.','5.','6.','7.','8.','9.'],
      quarterStr: null,
      quarterYr: null,
    }
  },
  methods: {
    renderQuarter() {
      if(!this.reportparams)
        return;
      const quarter = this.reportparams;
      this.quarterStr = quarter.split(" ")[0];
      this.quarterYr  = quarter.split(" ")[1];
    }
  },
  watch: {
    reportparams: {
      immediate: true,
      handler() {
        this.renderQuarter();
      }
    }
  }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
td {
  border-style: solid;
  border-width: 1px;
}
#version {
  text-align: right;
  padding-right: 5px;
  font-size: 10px;
}
.numbers {
  width: 2.5%;
  text-align: center;
  border-width: 0px 1px 0px 0px;
  border-style: dotted;
}
.row-title {
  width: 17.75%;
  text-align: left;
  padding-left: 5px;
  border-style: dotted;
}
.signatures {
  width: 39.875%;
  text-align: left;
  padding-left: 5px;
  border-style: dotted;
}
.row-name {
  width: 39.875%;
  text-align: left;
  padding-left: 5px;
  border-style: dotted;
  border-left-style: solid;
}
.no-borders {
  border-width: 0px;
}
#version-row td {
  height: 30px;
}
</style>