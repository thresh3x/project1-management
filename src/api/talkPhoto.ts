import type {TalkPhoto, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postTalkPhoto = (data: TalkPhoto) => http.post('/blog/TalkPhoto', data).then(res => res.data)

export const getTalkPhoto = (query: Query) => http.get('/blog/TalkPhoto', {params: query}).then(res => res.data)

export const getOneTalkPhoto = (id: number) => http.get(`/blog/TalkPhoto/:${id}`).then(res => res.data)

export const patchTalkPhoto = (data: TalkPhoto) => http.patch(`/blog/TalkPhoto/:${data.id}`, data).then(res => res.data)

export const deleteTalkPhoto = (id: number) => http.delete(`/blog/TalkPhoto/:${id}`).then(res => res.data)