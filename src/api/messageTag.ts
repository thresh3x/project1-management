import type {MessageTag, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postMessageTag = (data: MessageTag) => http.post('/blog/MessageTag', data).then(res => res.data)

export const getMessageTag = (query: Query) => http.get('/blog/MessageTag', {params: query}).then(res => res.data)

export const getOneMessageTag = (id: number) => http.get(`/blog/MessageTag/${id}`).then(res => res.data)

export const patchMessageTag = (data: MessageTag) => http.patch(`/blog/MessageTag/${data.id}`, data).then(res => res.data)

export const deleteMessageTag = (id: number) => http.delete(`/blog/MessageTag/${id}`).then(res => res.data)