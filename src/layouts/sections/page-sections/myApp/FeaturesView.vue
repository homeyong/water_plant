<script setup>
import { onMounted, onUnmounted } from "vue";

//example components
import DefaultNavbar from "../../../../examples/navbars/NavbarDefault.vue";
//Vue Material Kit 2 components
import MaterialSocialButton from "@/components/MaterialSocialButton.vue";
import Header from "../../../../examples/Header.vue";

//image
import appbg from "@/assets/img/app-bg.jpg";

//dep
import Typed from "typed.js";
// Sections components
import BaseLayout from "../../components/BaseLayout.vue";
import View from "../../components/View.vue";

// Features page components
import FeatureOne from "./components/FeatureOne.vue";

// Features page components codes
import { feature1Code } from "./components/codes";

//nav-pills
import setNavPills from "@/assets/js/nav-pills";

//hooks
const body = document.getElementsByTagName("body")[0];
onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");
});
onUnmounted(() => {
  body.classList.remove("presentation-page");
  body.classList.remove("bg-gray-200");
});


</script>
<template>
  <DefaultNavbar :action="{
    route: 'javascript:;',
    label: 'My APP',
    color: 'btn-white',
  }" transparent />
  <div class="container position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <Header>
    <div class="page-header min-vh-75" :style="`background-image: url(${appbg})`" loading="lazy">
      <div class="container">
        <div class="row">
          <div class="col-lg-7 text-center mx-auto position-relative">
            <h1 class="text-white pt-3 mt-n5 me-2" :style="{ display: 'inline-block ' }">

            </h1>

          </div>
        </div>
      </div>
    </div>
  </Header>
  <FeatureOne />



  <div class="py-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-5 ms-auto">
          <h4 class="mb-1">Thank you for your support!</h4>
          <p class="lead mb-0">We deliver the best web products</p>
        </div>
        <div class="col-lg-5 me-lg-auto my-lg-auto text-lg-end mt-5">
          <MaterialSocialButton route="https://x.com/harvestbuddy1" component="twitter" color="twitter"
            label="Tweet" />
        </div>
      </div>
    </div>
  </div>
</template>
