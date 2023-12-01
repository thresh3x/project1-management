export default {
    path: "/site",
    redirect: "/site/background",
    children: [
        {
            path: "/site/background",
            name: "background",
            component: () => import("@/views/site/background/index.vue"),
        },
        {
            path: "/site/message",
            name: "message",
            component: () => import("@/views/site/message/index.vue"),
        }
    ]
}
