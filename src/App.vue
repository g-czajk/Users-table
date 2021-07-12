<template>
  <div class="container mx-auto py-12">
    <Table
      :endpoint="endpoint"
      :search="search"
      :sorting="sorting"
      :pagination="pagination"
      @changeSorting="changeSorting"
      @changeSearch="changeSearch"
      @changePagination="changePagination"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Table from "./components/Table.vue";

export default defineComponent({
  name: "App",
  components: { Table },
  setup() {
    const endpoint = ref<string>("https://jsonplaceholder.typicode.com/users");
    const search = ref<boolean>(false);
    const sorting = ref<boolean>(false);
    const pagination = ref<boolean>(false);

    const changeSorting: () => void = () => {
      sorting.value = !sorting.value;
    };

    const changeSearch: () => void = () => {
      search.value = !search.value;
    };

    const changePagination: () => void = () => {
      pagination.value = !pagination.value;
    };

    return {
      endpoint,
      search,
      sorting,
      pagination,
      changeSorting,
      changeSearch,
      changePagination,
    };
  },
});
</script>
