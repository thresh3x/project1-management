import type {Config, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postConfig = (data: Config) => http.post('/blog/Config', data).then(res => res.data)

export const getConfig = (query: Query) => http.get('/blog/Config', {params: query}).then(res => res.data)

export const getOneConfig = (id: number) => http.get(`/blog/Config/${id}`).then(res => res.data)

export const patchConfig = (data: Config) => http.patch(`/blog/Config/${data.id}`, data).then(res => res.data)

export const deleteConfig = (id: number) => http.delete(`/blog/Config/${id}`).then(res => res.data)