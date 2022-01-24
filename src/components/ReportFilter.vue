<template>
    <ion-row>
        <ion-col v-if="showPerPageFilter">
            <br/>
            <select class="input_display" v-model="itemsPerPage" :disabled="disablePerPageFilter">
                <option :selected="itemsPerPage === 5" :value="5">5 rows/page</option>
                <option :selected="itemsPerPage === 10" :value="10">10 rows/page</option>
                <option :selected="itemsPerPage === 20" :value="20">20 rows/page</option>
                <option :selected="itemsPerPage === 50" :value="50">50 rows/page</option>
                <option :selected="itemsPerPage === 100" :value="100">100 rows/page</option>
                <option :selected="itemsPerPage === 1000" :value="1000">1000 rows/page</option>
                <option :selected="itemsPerPage === totalRowCount" :value="totalRowCount">Show all rows({{totalRowCount}})</option>
            </select>
        </ion-col>
        <ion-col>
            <ion-input
                :disabled="disableSearchFilter"
                class="input_display"
                :value="searchFilter"
                @click="launchSearcher"
                placeholder="Search here...">
            </ion-input>
        </ion-col>
    </ion-row>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import {
    IonCol,
    IonRow,
    IonInput,
    modalController
} from "@ionic/vue"
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import { Field } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";

export default defineComponent({
    emits: [ 'onItemsPerPage', 'onSearchFilter' ],
    components: { 
        IonCol, 
        IonRow, 
        IonInput 
    },
    props: {
        totalRowCount: {
            type: Number,
            default: 15000
        },
        disableSearchFilter: {
            type: Boolean,
            default: false
        },
        disablePerPageFilter: {
            type: Boolean,
            default: false
        },
        showPerPageFilter: {
            type: Boolean,
            default: false
        }
    },
    setup(props, {emit}) {
        const itemsPerPage = ref(50)
        const searchFilter = ref('')

        async function launchKeyboard(currentField: Field, onFinish: Function) {
          const modal = await modalController.create({
            component: TouchField,
            backdropDismiss: false,
            cssClass: "full-modal",
            componentProps: {
              dismissType: 'modal',
              currentField,
              onFinish
            }
          });
          modal.present();
        }

        function launchSearcher() {
           launchKeyboard({
                id: 'search',
                helpText: 'Search table data',
                defaultValue: () => searchFilter.value,
                type: FieldType.TT_TEXT,
            }, 
            (data: any) => {
                searchFilter.value = data ? data.value : ''
                emit('onSearchFilter', searchFilter.value)
            })
        }

        watch(itemsPerPage, (newValue) => {
            console.log(props.totalRowCount)
            if(typeof newValue === 'number') emit('onItemsPerPage', newValue)
        }, 
        { 
            immediate: true 
        })

        return {
            itemsPerPage,
            searchFilter,
            launchKeyboard,
            launchSearcher
        }
    },
})
</script>
