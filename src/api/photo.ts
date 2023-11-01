import type {Photo, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postPhoto = (data: Photo) => http.post('/blog/Photo', data).then(res => res.data)

export const getPhoto = (query: Query) => http.get('/blog/Photo', {params: query}).then(res => res.data)

export const getOnePhoto = (id: number) => http.get(`/blog/Photo/:${id}`).then(res => res.data)

export const patchPhoto = (data: Photo) => http.patch(`/blog/Photo/:${data.id}`, data).then(res => res.data)

export const deletePhoto = (id: number) => http.delete(`/blog/Photo/:${id}`).then(res => res.data)