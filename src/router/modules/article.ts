export default {
    path: "/article",
    name: 'article',
    redirect: "/article/articleList",
    children: [
        {
            path: "/article/articleList",
            name: "articleList",
            component: () => import("@/views/article/article-manage/index.vue"),
        },
        {
            path: "/article/addArticle",
            name: "addArticle",
            component: () => import("@/views/article/add-edit-article/index.vue"),
        },
        {
            path: "/article/editArticle",
            name: "editArticle",
            component: () => import("@/views/article/add-edit-article/index.vue"),
          },
        {
            path: "/article/tagsManagement",
            name: "tagsManage",
            component: () => import("@/views/tag/index.vue"),
        },
        {
            path: "/article/categoryManagement",
            name: "categoryManage",
            component: () => import("@/views/category/index.vue"),
        }
    ]
}
