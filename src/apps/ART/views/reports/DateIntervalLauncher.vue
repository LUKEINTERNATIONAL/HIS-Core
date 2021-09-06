<template>
    <his-standard-form 
        :skipSummary="true" 
        :fields="fields" 
        @onFinish="onFinish"
    />
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"

export default defineComponent({
    mixins: [ReportMixin],
    data: () => ({
      pathName: '' as string
    }),
    watch: {
        '$route' : {
            handler({ query }: any) {
                if (query && query.report) {
                    this.pathName = query.report
                }
            },
            deep: true,
            immediate: true
        }
    },
    async created() {
        this.fields = this.getDateDurationFields() 
    },
    methods: {     
        onFinish(_: any, c: any) {
            this.$router.push({ 
                name: this.pathName,
                query: {
                    start: c.start_date,
                    end: c.end_date
                } 
            })
        }
    }
})
</script>
