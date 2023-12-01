import type {Photo, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postPhoto = (data: Partial<Photo>) => http.post('/photo', data).then(res => res.data)

export const getPhoto = (query: Query) => http.get('/photo', {params: query}).then(res => res.data)

export const getOnePhoto = (id: number) => http.get(`/photo/${id}`).then(res => res.data)

export const patchPhoto = (data: Partial<Photo>) => http.patch(`/photo/${data.id}`, data).then(res => res.data)

export const deletePhoto = (id: number) => http.delete(`/photo/${id}`).then(res => res.data)