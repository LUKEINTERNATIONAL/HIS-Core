<template>
  <component
    v-bind:is="formType"
    :fields="fields"
    :skipSummary="skipSumary"
    :activeField="activeField"
    :cancelDestinationPath="cancelDestinationPath"
    @onFinish="onFinish"
    >
  </component>
</template>

<script lang="ts">
import TouchScreenForm from "@/components/Forms/TouchScreenForm.vue";
import { defineComponent, PropType } from "vue";
import { Field } from "./FieldInterface";

export default defineComponent({
    name: "HisStandardForm",
    components: { TouchScreenForm },
    data: () => ({
        formType: 'TouchScreenForm' as 
            | 'TouchScreenForm' 
            | 'MultiFieldForm'
    }),
    props: {
        skipSummary: {
            type: Boolean,
            default: false
        },
        activeField: {
            type: String
        },
        fields: {
            type: Object as PropType<Field[]>,
            required: true
        },
        cancelDestinationPath: {
            type: String,
            required: false,
        }
    }
})
</script>
