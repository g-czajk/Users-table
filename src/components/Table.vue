<template>
  <div>
    <!-- table -->
    <div class="min-h-1/2 mb-4">
      <table
        v-if="usersData.length"
        class="table-fixed border-separate border border-blue-200 mx-auto mt-12 max-w-screen-xl"
      >
        <thead>
          <tr>
            <th
              v-for="(column, index) in columns"
              @click="handleSortOnClick($event, column)"
              :key="index"
              class="w-1/5 py-2 cursor-pointer select-none"
              data-order="desc"
            >
              <div class="flex justify-center">
                <div>{{ column }}</div>
                <span v-show="sorting" class="material-icons text-gray-400 ml-2"
                  >arrow_drop_down</span
                >
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, index) in dataSource"
            :key="user.id"
            :class="{ 'bg-blue-200': index % 2 === 0 }"
          >
            <td
              v-for="(column, j) in columns"
              :key="j"
              :class="{
                'text-center py-2': true,
                'text-blue-700 font-medium px-4': column === 'Email',
              }"
            >
              <span v-if="column === 'Name'">{{ user.name }}</span>
              <span v-if="column === 'Company Name'">{{
                user.company.name
              }}</span>
              <span v-if="column === 'City'">{{ user.address.city }}</span>
              <span v-if="column === 'Website'">{{ user.website }}</span>
              <span v-if="column === 'Email'"
                ><a :href="`mailto: ${user.email}`">{{ user.email }}</a></span
              >
            </td>
          </tr>
        </tbody>
      </table>

      <!-- error message (if there's no data matching filter criteria) -->

      <div
        v-if="usersData.length && !filteredData.length"
        class="text-center font-bold text-red-500 mt-16"
      >
        No results matching criteria
      </div>
    </div>

    <!-- handle displaying of table columns -->

    <div v-if="usersData.length" class="flex justify-center items-center mb-4">
      <span class="mr-6 font-bold">Display columns:</span>
      <span class="mr-2">Name</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Name"
        v-model="columns"
      />
      <span class="mr-2">Email</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Email"
        v-model="columns"
      />
      <span class="mr-2">Company Name</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Company Name"
        v-model="columns"
      />
      <span class="mr-2">City</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="City"
        v-model="columns"
      />
      <span class="mr-2">Website</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Website"
        v-model="columns"
      />
    </div>

    <!-- enable/disable pagination -->

    <div
      v-if="usersData.length"
      class="flex flex-col justify-center items-center mb-4"
    >
      <div :class="{ 'mb-4': pagination }">
        <input
          type="checkbox"
          class="rounded mr-2 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
          value="Name"
          @change="$emit('changePagination')"
        />
        <span class="font-bold">Enable pagination</span>
      </div>

      <VueTailwindPagination
        v-if="pagination"
        :current="currentPage"
        :total="filteredData.length"
        :per-page="3"
        @page-changed="
          currentPage = $event;
          offset = $event - 1;
        "
        class="flex justify-center items-center mb-4"
      />
    </div>

    <!-- enable/disable sorting -->

    <div v-if="usersData.length" class="flex justify-center items-center mb-4">
      <input
        type="checkbox"
        class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        @change="$emit('changeSorting')"
      />
      <span class="ml-2 mr-4 font-bold">Enable sorting</span>
    </div>

    <!-- enable/disable searching -->

    <div
      v-if="usersData.length"
      class="flex flex-col justify-center items-center"
    >
      <div class="mb-4">
        <input
          type="checkbox"
          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
          @change="$emit('changeSearch')"
        />
        <span class="ml-2 mr-4 font-bold">Enable searching</span>
      </div>
      <input
        type="text"
        class="mr-2 block w-1/4 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-50"
        placeholder="Search for data"
        v-model="searchInput"
        :disabled="!search"
        @keydown="
          currentPage = 1;
          offset = 0;
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, watch, computed } from "vue";
import Data from "../types/Data";
import VueTailwindPagination from "@ocrv/vue-tailwind-pagination";

export default defineComponent({
  name: "Table",

  props: {
    endpoint: {
      type: String,
      required: true,
    },
    search: {
      type: Boolean,
      required: true,
    },
    sorting: {
      type: Boolean,
      required: true,
    },
    pagination: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    VueTailwindPagination,
  },

  setup(props, { emit }) {
    // load data from API

    const usersData = ref<Data[] | []>([]);

    const loadData = async (url: string) => {
      await fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
          usersData.value = responseData;
        })
        .catch((err) => console.log(err));
    };

    loadData(props.endpoint);

    // define table columns

    const columns = ref<string[]>([
      "Name",
      "Email",
      "Company Name",
      "City",
      "Website",
    ]);

    // define source of displayed data based on pagination on/off

    const dataSource = computed(() => {
      if (props.pagination) {
        return paginatedData.value;
      } else return filteredData.value;
    });

    // sorting

    const sortBy = ref<string>("");

    const sortedData = computed(() => {
      const users: Data[] = [...usersData.value];

      const sortAsc = (criteria1: string, criteria2?: string) => {
        return users.sort((a: any, b: any) => {
          if (criteria2) {
            return a[criteria1][criteria2].localeCompare(
              b[criteria1][criteria2]
            );
          } else return a[criteria1].localeCompare(b[criteria1]);
        });
      };

      const sortDesc = (criteria1: string, criteria2?: string) => {
        return users.sort((a: any, b: any) => {
          if (criteria2) {
            return b[criteria1][criteria2].localeCompare(
              a[criteria1][criteria2]
            );
          } else return b[criteria1].localeCompare(a[criteria1]);
        });
      };

      if (props.sorting) {
        switch (sortBy.value) {
          case "Name asc":
            return sortAsc("name");
          case "Name desc":
            return sortDesc("name");
          case "Email asc":
            return sortAsc("email");
          case "Email desc":
            return sortDesc("email");
          case "Company Name asc":
            return sortAsc("company", "name");
          case "Company Name desc":
            return sortDesc("company", "name");
          case "City asc":
            return sortAsc("address", "city");
          case "City desc":
            return sortDesc("address", "city");
          case "Website asc":
            return sortAsc("website");
          case "Website desc":
            return sortDesc("website");
          default:
            return users;
        }
      } else return users;
    });

    const handleSortOnClick = (event: any, criteria: string) => {
      if (props.sorting) {
        const target = event.currentTarget;
        const allColumnHeadings = document.querySelectorAll("[data-order]");
        const allIcons = document.querySelectorAll(".material-icons");
        const clickedIcon = event.currentTarget.children[0].children[1];

        allColumnHeadings.forEach((heading) => {
          if (heading === target) return;
          heading.setAttribute("data-order", "desc");
        });

        allIcons.forEach((icon) => {
          if (icon === clickedIcon) return;
          icon.textContent = "arrow_drop_down";
          icon.classList.add("text-gray-400");
        });

        if (target.dataset.order === "asc") {
          target.setAttribute("data-order", "desc");
          clickedIcon.textContent = "arrow_drop_up";
        } else {
          target.setAttribute("data-order", "asc");
          clickedIcon.classList.remove("text-gray-400");
          clickedIcon.textContent = "arrow_drop_down";
        }

        sortBy.value = `${criteria} ${target.getAttribute("data-order")}`;
      }
    };

    // reset sorting after adding/removing columns

    watch(columns, () => {
      const allColumnHeadings = document.querySelectorAll("[data-order]");
      const allIcons = document.querySelectorAll(".material-icons");
      allColumnHeadings.forEach((heading) => {
        heading.setAttribute("data-order", "desc");
      });
      allIcons.forEach((icon) => {
        icon.textContent = "arrow_drop_down";
        icon.classList.add("text-gray-400");
      });
      sortBy.value = "";
    });

    // searching (filtering) the table

    const searchInput = ref<string>("");

    const filteredData = computed(() => {
      const filtered: Data[] = sortedData.value.filter((data) => {
        return (
          data.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
          data.email.toLowerCase().includes(searchInput.value.toLowerCase()) ||
          data.company.name
            .toLowerCase()
            .includes(searchInput.value.toLowerCase()) ||
          data.address.city
            .toLowerCase()
            .includes(searchInput.value.toLowerCase()) ||
          data.website.toLowerCase().includes(searchInput.value.toLowerCase())
        );
      });

      if (props.search) {
        return filtered;
      } else return sortedData.value;
    });

    // pagination

    const currentPage = ref<number>(1);
    const offset = ref<number>(0);

    const paginatedData = computed(() => {
      return filteredData.value.slice(offset.value * 3, offset.value * 3 + 3);
    });

    // watch table data changes and emit "changeData" event

    watchEffect(() => emit("changeData", filteredData.value));

    return {
      usersData,
      sortedData,
      columns,
      handleSortOnClick,
      searchInput,
      filteredData,
      currentPage,
      offset,
      dataSource,
    };
  },
});
</script>
