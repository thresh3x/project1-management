import type {Tag, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postTag = (data: Tag) => http.post('/blog/Tag', data).then(res => res.data)

export const getTag = (query: Query) => http.get('/blog/Tag', {params: query}).then(res => res.data)

export const getOneTag = (id: number) => http.get(`/blog/Tag/:${id}`).then(res => res.data)

export const patchTag = (data: Tag) => http.patch(`/blog/Tag/:${data.id}`, data).then(res => res.data)

export const deleteTag = (id: number) => http.delete(`/blog/Tag/:${id}`).then(res => res.data)