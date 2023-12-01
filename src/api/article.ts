import type {Article, ArticleQuery, PatchType} from '@/project1-libcommon/index'
import http from "@/utils/http";

export const postArticle = (data: Article) => http.post('/blog/article', data).then(res => res.data)

export const getArticle = (query: ArticleQuery) => http.get('/blog/article', {params: query}).then(res => res.data)

export const getOneArticle = (id: number) => http.get(`/blog/article/${id}`).then(res => res.data)

export const patchArticle = (data: Partial<Article>): Promise<PatchType> => http.patch(`/blog/article/${data.id}`, data).then(res => res.data)

export const deleteArticle = (id: number) => http.delete(`/blog/article/${id}`).then(res => res.data)

export const titleExist = (query: {id:number; title: string}) => http.get('/blog/title/exist', {params: query}).then(res => res.data)