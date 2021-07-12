<template>
  <div>
    <!-- table -->
    <div class="min-h-55">
      <table
        v-if="usersData.length"
        class="table-fixed border-separate border border-blue-200 mx-auto mt-12 max-w-screen-xl"
      >
        <thead>
          <tr>
            <th
              v-for="(heading, index) in headings"
              @click="handleSortOnClick($event, heading)"
              :key="index"
              class="w-1/5 py-2 cursor-pointer select-none"
              data-order="desc"
            >
              <div class="flex justify-center">
                <div>{{ heading }}</div>
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
              v-for="(heading, j) in headings"
              :key="j"
              :class="{
                'text-center py-2': true,
                'text-blue-700 font-medium px-4': heading === 'Email',
              }"
            >
              {{ heading === "Name" ? user.name : null }}
              {{ heading === "Company Name" ? user.company.name : null }}
              {{ heading === "City" ? user.address.city : null }}
              {{ heading === "Website" ? user.website : null }}
              <a v-if="heading === 'Email'" :href="`mailto: ${user.email}`">{{
                user.email
              }}</a>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="usersData.length && !filteredData.length"
        class="text-center font-bold text-red-500 mt-16"
      >
        No results matching criteria
      </div>
    </div>

    <!-- error message (no data matching filter criteria) -->

    <!-- display columns -->

    <div v-if="usersData.length" class="flex justify-center items-center mb-4">
      <span class="mr-6 font-bold">Display columns:</span>
      <span class="mr-2">Name</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Name"
        v-model="headings"
      />
      <span class="mr-2">Email</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Email"
        v-model="headings"
      />
      <span class="mr-2">Company Name</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Company Name"
        v-model="headings"
      />
      <span class="mr-2">City</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="City"
        v-model="headings"
      />
      <span class="mr-2">Website</span>
      <input
        type="checkbox"
        class="rounded mr-4 border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        value="Website"
        v-model="headings"
      />
    </div>

    <!-- enable pagination -->

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

    <!-- enable sorting -->

    <div v-if="usersData.length" class="flex justify-center items-center mb-4">
      <input
        type="checkbox"
        class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
        @change="$emit('changeSorting')"
      />
      <span class="ml-2 mr-4 font-bold">Enable sorting</span>
    </div>

    <!-- enable searching -->

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
  name: "Table",
  components: {
    VueTailwindPagination,
  },
  setup(props, { emit }) {
    const headings = ref<string[]>([
      "Name",
      "Email",
      "Company Name",
      "City",
      "Website",
    ]);

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

    // define source of displayed data

    const dataSource = computed(() => {
      if (props.pagination) {
        return paginatedData.value;
      } else return filteredData.value;
    });

    // sorting

    const sortBy = ref<string>("");

    const sortedData = computed(() => {
      const users = [...usersData.value];

      if (props.sorting) {
        switch (sortBy.value) {
          case "Name asc":
            return users.sort((a, b) => a.name.localeCompare(b.name));
          case "Name desc":
            return users.sort((a, b) => b.name.localeCompare(a.name));
          case "Email asc":
            return users.sort((a, b) => a.email.localeCompare(b.email));
          case "Email desc":
            return users.sort((a, b) => b.email.localeCompare(a.email));
          case "Company Name asc":
            return users.sort((a, b) =>
              a.company.name.localeCompare(b.company.name)
            );
          case "Company Name desc":
            return users.sort((a, b) =>
              b.company.name.localeCompare(a.company.name)
            );
          case "City asc":
            return users.sort((a, b) =>
              a.address.city.localeCompare(b.address.city)
            );
          case "City desc":
            return users.sort((a, b) =>
              b.address.city.localeCompare(a.address.city)
            );
          case "Website asc":
            return users.sort((a, b) => a.website.localeCompare(b.website));
          case "Website desc":
            return users.sort((a, b) => b.website.localeCompare(a.website));
          default:
            return users;
        }
      } else return users;
    });

    const handleSortOnClick = (event: any, criteria: string) => {
      if (props.sorting) {
        const target = event.currentTarget;
        const allHeadings = document.querySelectorAll("[data-order]");
        const allIcons = document.querySelectorAll(".material-icons");
        const clickedIcon = event.currentTarget.children[0].children[1];

        allHeadings.forEach((heading) => {
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

    watch(headings, () => {
      const allHeadings = document.querySelectorAll("[data-order]");
      const allIcons = document.querySelectorAll(".material-icons");
      allHeadings.forEach((heading) => {
        heading.setAttribute("data-order", "desc");
      });
      allIcons.forEach((icon) => {
        icon.textContent = "arrow_drop_down";
        icon.classList.add("text-gray-400");
      });
    });

    // searching

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

    // watch table data and emit "changeData" event when data changes

    watchEffect(() => emit("changeData", filteredData.value));

    return {
      usersData,
      sortedData,
      headings,
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
