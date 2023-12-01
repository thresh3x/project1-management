import { defineStore } from 'pinia'
import type { User } from '@/project1-libcommon'
import router from '@/router'

export const useUserStore = defineStore({
    id: "user",
    state: (): Partial<User> => ({
        username: '',
        role: 0,
        avatar: '',
        nick_name: '',
        id: 0
    }),
    getters: {
        getAvatar(): string | undefined {
            return this.avatar
        },
        getName(): string | undefined {
            return this.username
        },
        getNickName(): string | undefined {
            return this.nick_name
        },
        getUserId(): number | undefined {
            return this.id
        },
        getRole(): number | undefined {
            return this.role
        }
    },
    actions: {
        SET_USERNAME(username: string) {
          this.username = username;
        },
        SET_ROLE(role: number) {
          this.role = role;
        },
        SET_AVATAR(avatar: string) {
          this.avatar = avatar;
        },
        SET_NICKNAME(nick_name: string) {
          this.nick_name = nick_name;
        },
        SET_ID(id: number) {
          this.id = id;
        },
        logOut() {
          this.username = ''
          this.role = 0
          localStorage.clear()
          router.push('/login')
        }
    }
})