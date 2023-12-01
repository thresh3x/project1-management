export default {
    path: "/talk",
    redirect: "/talk/talkList",
    children: [
      {
        path: "/talk/talkList",
        name: "talkList",
        component: () => import("@/views/talk/talk-list/index.vue"),
        meta: {
          title: "说说列表"
        }
      },
      {
        path: "/talk/addTalk",
        name: "addTalk",
        component: () => import("@/views/talk/add-edit-talk/index.vue"),
      },
      {
        path: "/talk/editTalk",
        name: "editTalk",
        component: () => import("@/views/talk/add-edit-talk/index.vue"),
      },
    ]
  }
  