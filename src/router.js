import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const routes = [
  {
    path: "/meet/:meet/app",
    props: true,
    component: () =>
      import("./pages/app")
  },
  {
    path: "/meet/:meet/qr",
    props: true,
    component: () =>
      import("./pages/qrcode")
  },
  {
    path: "/meet/:meet",
    name: "meet",
    props: true,
    component: () =>
      import(/* webpackChunkName: "page-meet" */ "./pages/meeting"),
    children: [
    ]
  },
  {
    path: "/",
    name: "Lobby",
    props: true,
    redirect: "/meet/Foyer-Lobby/"
  },
  // 404
  {
    path: "*",
    redirect: "/meet/Foyer-Lobby/"
  }


];

export default new Router({
  //mode: "history",
  routes
});
