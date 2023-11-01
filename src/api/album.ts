import type {Album, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postAlbum = (data: Album) => http.post('/blog/Album', data).then(res => res.data)

export const getAlbum = (query: Query) => http.get('/blog/Album', {params: query}).then(res => res.data)

export const getOneAlbum = (id: number) => http.get(`/blog/Album/:${id}`).then(res => res.data)

export const patchAlbum = (data: Album) => http.patch(`/blog/Album/:${data.id}`, data).then(res => res.data)

export const deleteAlbum = (id: number) => http.delete(`/blog/Album/:${id}`).then(res => res.data)