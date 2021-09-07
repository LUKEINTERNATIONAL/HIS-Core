<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <h1> <b>{{ title }}</b> ({{ period }}) </h1>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="report-content">
        <slot> </slot>
      </div>
    </ion-content>
    <his-footer color="light" :btns="btns"> </his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TemplateMixinVue from "../TemplateMixin.vue";

export default defineComponent({
  mixins: [TemplateMixinVue]
})
</script>
