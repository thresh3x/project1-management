import type {Message, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postMessage = (data: Message) => http.post('/blog/Message', data).then(res => res.data)

export const getMessage = (query: Query) => http.get('/blog/Message', {params: query}).then(res => res.data)

export const getOneMessage = (id: number) => http.get(`/blog/Message/${id}`).then(res => res.data)

export const patchMessage = (data: Message) => http.patch(`/blog/Message/${data.id}`, data).then(res => res.data)

export const deleteMessage = (id: number) => http.delete(`/blog/Message/${id}`).then(res => res.data)