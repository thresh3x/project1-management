import http from "@/utils/http";
import { compressAccurately } from "image-conversion"
import { ElMessage } from "element-plus"
import { getArticle } from "./article";
import { getCategory } from "./category";
import { getTag } from "./tag";
import { getUser } from "./user";
import type { Article } from "@/project1-libcommon";
import { formatDateYM } from "@/utils/formatDateYM";

export const imgUpload = async (data: any) => {
    let res: any

    if (data.raw.size > 800) {
        const file = await conversion(data.raw)
        if (!file) {
            ElMessage.error("Image Upload Error")
            return
        } else {
            res = file
        }
    } else {
        res = data.raw
    }
    const formData = new FormData()
    formData.append("file", res)
    return new Promise(resolve => {
        http.post('/upload/image', formData).then(res => resolve(res.data))
    })
}

export const mdImgUpload = async (data: any) => {
    let res
    if (data.size > 800) {
        const file = await conversion(data)
        if (!file) {
            ElMessage.error('Image upload error')
            return
        } else {
            res = file
        }
    } else {
        res = data
    }
    const formData = new FormData()
    formData.append('file', res)
    return new Promise(resolve => {
        http.post('/upload/image', formData).then(res => resolve(res.data))
    })
}

export const conversion = (file: any) => {
    return new Promise<Blob>(resolve => {
        compressAccurately(file, 800).then(res => {
            resolve(res)
        })
    })
}

type CommitItem = [string, number]
type CommitList = Array<CommitItem>

function handleArticleData(articleData: Array<Article>) {
    const final: CommitList = []
    const endMonth = new Date(articleData[0].createdAt).getMonth() + 1
    
    articleData.forEach(item => {
        const date = formatDateYM(new Date(item.createdAt))
        let exit = false
        for (let i=0; i < final.length; i++) {
            if (final[i][0] === date) {
                exit = true
                final[i][1] += 1
                break
            }
        }
        if (!exit) { final.push([date, 1]) }
    })
    return final
}

export const getStatistic = async () => {
    const article = await getArticle({keyWord: '', page: 1, pageSize: 1000})
    const articleData = (article.data as Array<Article>)
    const commitList = handleArticleData(articleData)
    
    const category = await getCategory({keyWord: '', page: 1, pageSize: 1})
    const tag = await getTag({keyWord: '', page: 1, pageSize: 1})
    const user = await getUser({keyWord: '', page: 1, pageSize: 1})
    return {
        articleCount: article.total,
        categoryCount: category.total,
        tagCount: tag.total,
        userCount: user.total,
        commitList
    }
}