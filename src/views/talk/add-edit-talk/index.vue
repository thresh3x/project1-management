<template>
    <el-card class="talk-card">
        <template #header>
            <div class="header">
                <div>
                    {{ route.query.id ? "Edit talk" : "Add talk" }}
                </div>
                <div>
                    <el-button type="info" size="small" @click="cancel">Cancel</el-button>
                    <el-button type="danger" size="small" @click="save">Save</el-button>
                </div>
            </div>
        </template>
        <el-form ref="formRef" :model="form" label-width="60px" label-suffix=":">
            <el-form-item label="Content">
                <el-input type="textarea" v-model="form.content" clearable class=""
                    :autosize="{ minRows: 4, maxRows: 8 }" />
            </el-form-item>
            <el-form-item label="Photo" class="img-form">
                <Upload v-model:fileList="form.talkImgList" :width="80" :height="80" :limit="9" :multiple="true"
                    :preview="false" />
            </el-form-item>
            <el-form-item label="Is top">
                <el-switch v-model="form.is_top" :active-value="1" :inactive-value="2" />
            </el-form-item>
            <el-form-item label="Status">
                <el-select v-model="form.status" class="">
                    <el-option label="Open" :value="1" />
                    <el-option label="Hide" :value="2" />
                </el-select>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElLoading } from 'element-plus'
import { conversion, imgUpload } from '@/api/site'
import { useUserStore } from '@/stores/user';
import { getOneTalk, patchTalk, postTalk } from '@/api/talk';
import Upload from '@/components/Upload/index.vue'
import { UploadType } from '@/project1-libcommon/index'
const route = useRoute()
const router = useRouter()

const form = reactive({
    id: null,
    content: "", // 说说内容
    is_top: 2, // 置顶 2 取消置顶 3
    status: 1, // 1 公开 2 私密
    talkImgList: [],
    user_id: 0
})

const save = async () => {
    if (form.content || form.talkImgList.length > 0) {
        let needUploadList = [];
        const restList = [];
        if (route.query.id) {
            needUploadList = form.talkImgList.filter(item => !item.id);
            form.talkImgList.forEach(img => {
                if (img.id) {
                    restList.push({ id: img.id, url: img.url });
                }
            });
        } else {
            needUploadList = form.talkImgList;
        }
        // 压缩
        const conversionLoading = ElLoading.service({
            fullscreen: true,
            text: "Photo conversing"
        });
        const conversionPromiseList = needUploadList.map(async v => {
            return await conversion(v.raw);
        });

        const conversionUploadList = [];
        await Promise.all(conversionPromiseList).then(res => {
            res.map(raw => {
                conversionUploadList.push({ raw });
            });
        });
        conversionLoading.close();
        // 图片上传
        const imgUploading = ElLoading.service({
            fullscreen: true,
            text: "Uploading......"
        });
        const promiseList = conversionUploadList.map(async v => {
            return await imgUpload(v);
        });
        await Promise.all(promiseList).then(res => {
            res.map((img: UploadType) => {
                if (img.code == 0) {
                    const { url } = img;
                    const obj = route.query.id
                        ? { id: route.query.id, url: url }
                        : { url };
                    restList.push(obj);
                } else {
                    ElMessage({
                        showClose: true,
                        message: 'Photo upload error',
                        type: 'error',
                    })
                }
            })
        })
        imgUploading.close()
        // 新增 / 修改说说
        form.talkImgList = restList;
        form.talkImgList.forEach(item => {
            delete item.uid
            delete item.status
        })
        if (!route.query.id) {
            const userId = useUserStore()?.getUserId;
            Object.assign(form, { user_id: userId });
        }
        const res = route.query.id ? await patchTalk(form) : await postTalk(form);
        console.log(res);
        
        if (res.id) {
            ElMessage({
                showClose: true,
                message: `${route.query.id ? "Edit success" : "Publish success"}`,
                type: 'success',
            })
            router.go(-1)
        } else {
            ElMessage({
                showClose: true,
                message: `${route.query.id ? "Edit error" : "Publish error"}`,
                type: 'error',
            })
        }
    } else {
        ElMessage({
            showClose: true,
            message: "Talk photo and content cant be all empty",
            type: 'warning',
        })
    }
};

const cancel = () => {
    router.go(-1);
}

const getTalkDetailById = async id => {
    const res = await getOneTalk(id);
    if (res.id) {
        res.talkImgList = res.talkImgList.map(img => {
            return {
                id: id,
                url: img
            };
        });
        Object.assign(form, res);
    }
}

onMounted(() => {
    if (route.query.id) {
        getTalkDetailById(route.query.id);
    }
})
</script>

<style lang='scss' scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.img-form {
    :deep(.el-form-item__content) {
        width: 268px;
        height: 268px;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
    }
}

// 上传图片展示的大小
:deep(.el-upload-list__item) {
    width: 80px !important;
    height: 80px !important;
    margin: 3px !important;
    border: none !important;
    border-radius: 0;
}

// 加号背景大小
:deep(.el-upload--picture-card) {
    width: 80px !important;
    height: 80px !important;
    margin: 3px !important;
}

// 上传盒子总体的大小
:deep(.el-upload-list--picture-card) {
    width: 268px;
}
</style>