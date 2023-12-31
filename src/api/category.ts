import type {Category, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postCategory = (data: Partial<Category>) => http.post('/blog/Category', data).then(res => res.data)

export const getCategory = (query: Query) => http.get('/blog/Category', {params: query}).then(res => res.data)

export const getOneCategory = (id: number) => http.get(`/blog/Category/${id}`).then(res => res.data)

export const patchCategory = (data: Category) => http.patch(`/blog/Category/${data.id}`, data).then(res => res.data)

export const deleteCategory = (idList: string[]) => http.delete(`/blog/Category`, {params: {idList}}).then(res => res.data)