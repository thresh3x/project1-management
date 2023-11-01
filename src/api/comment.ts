import type {Comment, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postComment = (data: Comment) => http.post('/blog/Comment', data).then(res => res.data)

export const getComment = (query: Query) => http.get('/blog/Comment', {params: query}).then(res => res.data)

export const getOneComment = (id: number) => http.get(`/blog/Comment/:${id}`).then(res => res.data)

export const patchComment = (data: Comment) => http.patch(`/blog/Comment/:${data.id}`, data).then(res => res.data)

export const deleteComment = (id: number) => http.delete(`/blog/Comment/:${id}`).then(res => res.data)