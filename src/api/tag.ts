import type {Tag, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postTag = (data: Partial<Tag>) => http.post('/blog/tags', data).then(res => res.data)

export const getTag = (query: Query) => http.get('/blog/tags', {params: query}).then(res => res.data)

export const getOneTag = (id: number) => http.get(`/blog/tags/${id}`).then(res => res.data)

export const patchTag = (data: Tag) => http.patch(`/blog/tags/${data.id}`, data).then(res => res.data)

export const deleteTag = (idList: string[]) => http.delete(`/blog/tags`, {params: {idList}}).then(res => res.data)