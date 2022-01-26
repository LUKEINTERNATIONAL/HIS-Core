<template>
    <action-header :title="title" :subtitle="subtitle" :color="color"> </action-header>
    <ion-content style="text-align:center; padding-top: 70px;" :style="{backgroundColur: color}">
        <h2 style="margin-top: 5rem;">{{ body }}</h2>
    </ion-content>
    <action-footer :buttons="actionButtons"> </action-footer>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"

export default defineComponent({
    mixins: [ActionSheetMixin],
    props: {
        body: {
            type: String,
            require: true
        }
    }

})
</script>
<style scoped>

</style>
