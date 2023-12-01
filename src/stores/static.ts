import { defineStore } from "pinia";

interface Tab {
    key: string | number
    content: string
    title: string
}

export const useStaticStore = defineStore({
  id: "static",
  state: () => ({
    articleTab: [
      {
        key: "",
        content: "All article",
        title: "All article"
      },
      {
        key: 1,
        content: "Open article",
        title: "Open article"
      },
      {
        key: 2,
        content: "Hide article",
        title: "Hide article"
      },
      {
        key: 3,
        content: "Draft",
        title: "Draft"
      }
    ],
    photoTab: [
      {
        key: 1,
        content: "Album photo",
        title: "Album photo"
      },
      {
        key: 2,
        content: "Recycle bin",
        title: "Recycle bin"
      }
    ],
    talkTab: [
      {
        key: 1,
        content: "Open talk",
        title: "Open talk"
      },
      {
        key: 2,
        content: "Hide talk",
        title: "Hide talk"
      },
      {
        key: 3,
        content: "Recycle bin",
        title: "Recycle bin"
      }
    ]
  }),
  getters: {
    getArticleTab():Tab[] {
      return this.articleTab;
    },
    getPhotoTab():Tab[] {
      return this.photoTab
    },
    getTalkTab(): Tab[] {
      return this.talkTab
    }
  },
  actions: {}
})
