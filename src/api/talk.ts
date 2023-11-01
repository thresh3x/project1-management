import type {Talk, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postTalk = (data: Talk) => http.post('/blog/Talk', data).then(res => res.data)

export const getTalk = (query: Query) => http.get('/blog/Talk', {params: query}).then(res => res.data)

export const getOneTalk = (id: number) => http.get(`/blog/Talk/:${id}`).then(res => res.data)

export const patchTalk = (data: Talk) => http.patch(`/blog/Talk/:${data.id}`, data).then(res => res.data)

export const deleteTalk = (id: number) => http.delete(`/blog/Talk/:${id}`).then(res => res.data)