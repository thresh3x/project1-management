import type {Background, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postBackground = (data: Background) => http.post('/blog/Background', data).then(res => res.data)

export const getBackground = (query: Query) => http.get('/blog/Background', {params: query}).then(res => res.data)

export const getOneBackground = (id: number) => http.get(`/blog/Background/${id}`).then(res => res.data)

export const patchBackground = (data: Background) => http.patch(`/blog/Background/${data.id}`, data).then(res => res.data)

export const deleteBackground = (id: number) => http.delete(`/blog/Background/${id}`).then(res => res.data)