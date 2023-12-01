export default {
    path: '/album',
    redirect: "/album/album",
    children: [
        {
            path: '/album/album',
            name: 'album',
            component: () => import("@/views/album/album/index.vue"),
        },
        {
            path: "/album/photoList",
            name: "photoList",
            component: () => import("@/views/album/photoList/index.vue"),
          },
          {
            path: "/album/addPhotos",
            name: "addPhotos",
            component: () => import("@/views/album/photoList/add-photos.vue"),
          }
    ]
}