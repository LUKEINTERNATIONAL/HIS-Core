<template>
  <div class="pagination">
    <div class="btn-group">
      <ion-button color="light" @click="setFirstPage" :disabled="isInFirstPage">
        First
      </ion-button>
      <ion-button color="light" @click="prevPage">
        <ion-icon :icon="caretBack"></ion-icon>
      </ion-button>
      <ion-button
        v-for="page in pages"
        @click="setPage"
        :color="page.isDisabled ? 'primary' : 'light'"
        :key="page"
        :disabled="page.isDisabled"
      >
        {{ page.name }}
      </ion-button>
      <ion-button color="light" @click="nextPage">
        <ion-icon :icon="caretForward"></ion-icon>
      </ion-button>
      <ion-button color="light" @click="setLastPage" :disabled="isInLastPage">
        Last
      </ion-button>
    </div>
    <h6>Page {{ currentPage + 1 }} of {{ totalPages }}</h6>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { caretBack, caretForward } from "ionicons/icons";

export default defineComponent({
   props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 3
    },
    totalPages: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    }
  },
  emits: ['onChangePage'],
  setup(props, { emit }) {
    const isInFirstPage = computed(() => props.currentPage === 1)
    const isInLastPage = computed(() => props.currentPage === props.totalPages)
    const startPage = computed(() => {
      if(props.currentPage === 1) return 1
      if(props.currentPage === props.totalPages) return props.totalPages - props.maxVisibleButtons
      return props.currentPage - 1
    })
    const pages = computed(() => {
      const range = []
      for (
        let i = startPage.value; 
        i <= Math.min(startPage.value + props.maxVisibleButtons - 1, props.totalPages); 
        i++
      ) {
        range.push({
          name: i,
          isDisabled: i === props.currentPage
        })
      }
      return range
    })
    const setPage = (page: number) => emit('onChangePage', page)
    const setFirstPage = () => emit('onChangePage', 1)
    const setLastPage = () => emit('onChangePage', props.totalPages)
    const prevPage = () => {
      if(props.currentPage > 0) 
        emit('onChangePage', props.currentPage - 1)
    }
    const nextPage = () => {
      if((props.currentPage + 1) !== props.totalPages) 
        emit('onChangePage', props.currentPage + 11)
    }
    return {
      caretBack,
      caretForward,
      startPage,
      pages,
      isInFirstPage,
      isInLastPage,
      nextPage,
      prevPage,
      setPage,
      setFirstPage,
      setLastPage,
    }
  },
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  justify-items: center;
}
.pagination .btn-group {
  margin: .5rem;
  display: flex;
  justify-content: start;
}

.pagination ion-button {
  margin: .1rem;
}
h6 {
  margin-right: .5rem;
}
</style>
