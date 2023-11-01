import type {User, Query} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postUser = (data: Partial<User>) => http.post('/user', data).then(res => res.data)

export const getUser = (query: Query) => http.get('/user', {params: query}).then(res => res.data)

export const getOneUser = (query: Query) => http.get(`/user/one`, {params: query}).then(res => res.data)

export const patchUser = (data: Partial<User>) => http.patch(`/user/:${data.id}`, data).then(res => res.data)

export const deleteUser = (id: number) => http.delete(`/user/:${id}`).then(res => res.data)

export const registerUser = (data: Partial<User>) => http.post('/user/signin', data).then(res => res.data)

export const loginUser = (data: Partial<User>) => http.post('/user/login', data).then(res => res.data)
