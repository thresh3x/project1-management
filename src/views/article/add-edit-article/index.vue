<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>{{ articleForm.id ? "Edit" : "Add" }} Article</span>
            </div>
        </template>
        <el-form ref="articleFormRef" :inline="true" :model="articleForm" :rules="articleFormRules"
            class="bg-bg_color w-[99/100]" label-width="120">
            <el-form-item style="width: 65%" label-width="100" label="Article title" prop="title">
                <el-input v-model="articleForm.title" placeholder="please input title" clearable maxlength="20"
                    @change="articleTitleVAlidate" />
            </el-form-item>
            <el-form-item style="width: 25%">
                <div class="publish-btn">
                    <el-button type="danger" size="small" :icon="DocumentChecked" @click="publish(articleFormRef)">{{
                        articleForm.id ? "Edit" : "Publish" }} Article</el-button>
                </div>
            </el-form-item>
            <el-form-item style="width: 100%;" prop="content">
                <md-editor v-model="articleForm.content" @onUploadImg="uploadImage" />
            </el-form-item>
        </el-form>
        <el-dialog title="Publish article" v-model="dialogVisible" :width="800" draggable :fullscreen="true"
            :before-close="closeDialog">
            <el-form ref="dialogArticleFormRef" :inline="true" :model="articleForm" :rules="dialogArticleFormRules"
                class="bg-bg_color w-[99/100]" label-width="120">
                <el-form-item class="form-item100" label="Title" prop="title">
                    {{ articleForm.title }}
                </el-form-item>
                <el-form-item class="form-item100" label="Description" prop="description">
                    <el-input v-model="articleForm.description" placeholder="description of article" style="width: 70%"
                        clearable type="textarea" maxlength="150" resize="none" :autosize="{ minRows: 2, maxRows: 3 }"
                        show-word-limit />
                </el-form-item>
                <el-form-item label="Category" prop="category_id">
                    <el-select v-model="articleForm.category_id" :style="{ width: '380px' }"
                        placeholder="please select category" filterable clearable allow-create>
                        <el-option v-for="item in categoryOptionList" :key="item.name" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Tags" prop="tagIdList">
                    <el-select v-model="articleForm.tagIdList" :style="{ width: '380px' }" placeholder="please select tags"
                        multiple filterable clearable allow-create :multiple-limit="3">
                        <el-option v-for="item in tagOptionList" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item class="form-item100 article-cover" label="Article cover" prop="coverList">
                    <Upload v-model:file-list="articleForm.coverList" :width="260" :height="150" :limit="1" />
                </el-form-item>
                <el-form-item class="form-item100" label="Pinned">
                    <el-switch v-model="articleForm.is_top" size="small" active-text="yes" inactive-text="no"
                        :active-value="1" :inactive-value="2" />
                </el-form-item>
                <el-form-item class="form-item100" label="Status">
                    <el-radio-group v-model="articleForm.status">
                        <el-radio :label="1">open</el-radio>
                        <el-radio :label="2">privacy</el-radio>
                        <el-radio :label="3">draft</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button size="small" @click="closeDialog()">Cancel</el-button>
                <el-button size="small" type="danger" plain @click="submitForm(dialogArticleFormRef, 1)">
                    Save draft
                </el-button>
                <el-button size="small" type="danger" @click="submitForm(dialogArticleFormRef, 2)">
                    {{ articleForm.id ? "Edit" : "Publish" }} article
                </el-button>
            </template>
        </el-dialog>
        <el-dialog v-model="coverPreviewVisible">
            <img w-full :src="coverUrl" alt="Preview Image" />
        </el-dialog>
    </el-card>
</template>

<script setup lang='ts'>
import { ElLoading, ElMessage } from 'element-plus';
import { ref, reactive, onMounted } from 'vue'
import { getOneArticle, patchArticle, postArticle, titleExist } from '@/api/article'
import { DocumentChecked } from '@element-plus/icons-vue'
import { imgUpload, mdImgUpload } from '@/api/site'
import 'md-editor-v3/lib/style.css'
import { MdEditor } from 'md-editor-v3'
import Upload from '@/components/Upload/index.vue'
import { useUserStore } from '@/stores/user';
import { Article } from '@/project1-libcommon';
import { getTag } from '@/api/tag';
import { useRoute, useRouter } from 'vue-router';
import { getCategory } from '@/api/category';

const userStore = useUserStore()
const userId = userStore.getUserId
const route = useRoute()
const router = useRouter()
const articleFormRef = ref()
const dialogArticleFormRef = ref()
const canPublish = ref(true)
const dialogVisible = ref(false)

const articleForm = reactive({
    id: 0,
    title: "",
    category: {},
    category_id: null,
    tagIdList: [],
    tagList: [],
    author_id: 0,
    content: "",
    cover: "",
    is_top: 2, // 置顶 1 置顶 2 取消置顶
    status: 1, // 状态 1 公开 2 私密 3 回收站（相当于草稿）
    coverList: [],
    description: "" // 文章描述
})
const primaryArticle = reactive({...articleForm})
const tagOptionList = ref([])
const categoryOptionList = ref([])
const coverPreviewVisible = ref(false)
const coverUrl = ref(null)

const articleFormRules = reactive({
    title: {
        required: true,
        trigger: "blur",
        message: "please input article title"
    },
    content: {
        required: true,
        message: "please input article content",
        trigger: "blur"
    }
});

const tagV = (rule, value, cb) => {
    if (!value.length) {
        return cb(new Error("please select tag"));
    }
    cb();
};

const coverV = (rule, value, cb) => {
    if (!value.length) {
        return cb(new Error("please upload cover"));
    }
    cb();
};

const dialogArticleFormRules = reactive({
    category_id: {
        required: true,
        message: "please select category",
        trigger: ["change"]
    },
    description: {
        required: true,
        message: "please input description",
        trigger: ["blur"]
    },
    tagIdList: {
        required: true,
        message: "please select article tags",
        validator: tagV,
        trigger: ["change"]
    },
    coverList: {
        required: true,
        message: "please upload cover",
        validator: coverV,
        trigger: ["change"]
    }
});

async function articleTitleVAlidate() {
    const { id, title } = articleForm;
    const res = await titleExist({ id, title });
    if (res.result) {
        canPublish.value = false;
        ElMessage({
            showClose: true,
            message: 'Article title has existed, try other one',
            type: 'warning',
        })
    } else {
        canPublish.value = true;
    }
}

async function publish(formEl) {
    if (!formEl) return;
    if (!canPublish.value) {
        ElMessage({
            showClose: true,
            message: 'Article title has existed, try other one',
            type: 'warning',
        })
        return;
    }
    await formEl.validate(valid => {
        if (valid) {
            dialogVisible.value = true;
        } else {
            ElMessage({
                showClose: true,
                message: 'please fill info as prompted',
                type: 'warning',
            })
        }
    });
}

async function uploadImage(files, callback) {
    const res = await Promise.all(
        files.map(file => {
            return new Promise((resolve, reject) => {
                mdImgUpload(file).then((imgData: any) => {
                    if (imgData.code == 0) {
                        const { url } = imgData
                        resolve(url);
                    } else {
                        reject("Upload error");
                    }
                });
            });
        })
    );

    callback(res);
}

const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
}

const closeDialog = () => {
    resetForm(dialogArticleFormRef.value);
    dialogVisible.value = false;
}

const uploadCover = async () => {
    if (!articleForm.coverList[0].id) {
        const uploadLoading = ElLoading.service({
            fullscreen: true,
            text: 'Image upload loading'
        })
        const res: any = await imgUpload(articleForm.coverList[0])
        if (res.code == 0) {
            const { url } = res
            articleForm.cover = url
        }
        uploadLoading.close()
    }
}

const arrangeArticle = (articleForm) => {
    const { id, category_id, tagIdList, is_top, ...restArticle } = articleForm
    let newCategory
    const newTagList = []

    if (typeof category_id == 'number') {
        newCategory = categoryOptionList.value.find(category => (category.id == category_id))
    } else {
        newCategory = {
            name: category_id
        }
    }
    tagIdList.forEach(tagId => {
        if (typeof tagId == 'number') {
            newTagList.push(tagOptionList.value.find(tag => tag.id == tagId))
        } else {
            newTagList.push({
                name: tagId
            })
        }
    })
    restArticle.isTop = is_top
    restArticle.category = newCategory
    restArticle.tags = newTagList
    if (id) {
        restArticle.id = id
    } else {
        restArticle.author_id = userId || 1
    }
    delete restArticle.coverList
    delete restArticle.tagList
    return restArticle
}

const submitForm = async (formEl, type) => {
    await formEl.validate(async valid => {
        if (valid) {
            await uploadCover()
            if (type == 1) {
                articleForm.status = 3
            }
            const finalArticle: Article = arrangeArticle(articleForm)
            console.log(finalArticle, 'submit ======>');
            
            let res
            if (!finalArticle.id) {
                // add
                res = await postArticle(finalArticle)
            } else {
                // edit
                res = await patchArticle(finalArticle)
            }
            if (res.id) {
                ElMessage({
                    showClose: true,
                    message: 'Add article successfully',
                    type: 'success',
                })
                resetForm(formEl)
                Object.assign(articleForm, primaryArticle)
                dialogVisible.value = false
            } else if (res.affected && res.affected == 1) {
                ElMessage({
                    showClose: true,
                    message: 'Edit article successfully',
                    type: 'success',
                })
                router.back()
            } else {
                ElMessage({
                    showClose: true,
                    message: 'Operate article error',
                    type: 'error',
                })
            }
        } else {
            ElMessage({
                showClose: true,
                message: 'please fill info as prompted',
                type: 'warning',
            })
        }
    })
}

const getTagM = async () => {
    const res = await getTag({ keyWord: '', page: 1, pageSize: 100})
    if (res.data) {
        tagOptionList.value = res.data
    }
}

const getCategoryM = async () => {
    const res = await getCategory({ keyWord: '', page: 1, pageSize: 100})
    if (res.data) {
        categoryOptionList.value = res.data
    }
}

const getArticleDetailsById = async (article_id: string | number) => {
    const res: Article = await getOneArticle(+article_id)
    if (res.id) {
        const { cover, category, tags } = res
        Object.assign(articleForm, res)
        articleForm.category_id = category.id
        tags.forEach(item => {
            articleForm.tagIdList.push(item.id)
        })
        articleForm.coverList = [
            {
                id: 1,
                name: cover.split('/').pop(),
                url: cover
            }
        ]
    }
}

onMounted(async () => {
    await getTagM()
    await getCategoryM()
    if (!route.query.articleId) return

    getArticleDetailsById(route.query.articleId as string)
})

</script>

<style lang='scss' scoped>
.form-item {
    &45 {
        width: 45%;
        font-weight: bold;
    }

    &100 {
        width: 100%;
        font-weight: bold;
    }
}

:deep(.el-dialog.is-fullscreen) {
    width: 800px;
    overflow-y: auto;
    overflow-x: hidden;
}

:deep(.el-dialog__footer) {
    position: absolute;
    bottom: 0;
    right: 5%;
}

.article-cover {
    :deep(.el-form-item__content) {
        width: 260px !important;
        height: 150px !important;
    }

    :deep(.el-upload-list__item) {
        width: 260px !important;
        height: 150px !important;
        margin: 0 !important;
        border: none !important;
    }

    :deep(.el-upload--picture-card) {
        width: 260px !important;
        height: 150px !important;
    }

    :deep(.el-upload-list--picture-card) {
        width: 260px !important;
        height: 150px !important;
        margin: 0 !important;
        border: none !important;
    }
}
</style>