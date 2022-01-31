<template>
    <view-port>
        <div class="view-port-content"> 
            <his-table 
                :columns="columns" 
                :rows="rows"
            />
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import HisTable from "@/components/DataViews/tables/ReportDataTable.vue"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { ViewPort, HisTable },
    mixins: [FieldMixinVue],
    data: () => ({
        columns: [] as Array<string>,
        rows: [] as Array<string>,
    }),
    async activated() {
        this.$emit('onFieldActivated', this)
        if (typeof this.config.columns === "function") {
            this.columns = await this.config.columns(this.fdata, this.cdata)
        }
        if (typeof this.config.rows === "function") {
            this.rows = await this.config.rows(this.fdata, this.cdata)
        }
    }
})
</script>
<style scoped>
    .view-port-content {
        background: white !important;
    }
</style>