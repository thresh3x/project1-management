import type {Talk, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postTalk = (data: Partial<Talk>) => http.post('/talk', data).then(res => res.data)

export const getTalk = (query: Query) => http.get('/talk', {params: query}).then(res => res.data)

export const getOneTalk = (id: number) => http.get(`/talk/${id}`).then(res => res.data)

export const patchTalk = (data: Partial<Talk>) => http.patch(`/talk/${data.id}`, data).then(res => res.data)

export const deleteTalk = (id: number) => http.delete(`/talk/${id}`).then(res => res.data)