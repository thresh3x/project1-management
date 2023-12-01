import type {Album, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postAlbum = (data: Partial<Album>) => http.post('/album', data).then(res => res.data)

export const getAlbum = (query: Query) => http.get('/album', {params: query}).then(res => res.data)

export const getOneAlbum = (id: number) => http.get(`/album/${id}`).then(res => res.data)

export const patchAlbum = (data: Partial<Album>) => http.patch(`/album/${data.id}`, data).then(res => res.data)

export const deleteAlbum = (id: number) => http.delete(`/album/${id}`).then(res => res.data)