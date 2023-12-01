<template>
    <el-card>
        <template #header>
            <div class="flex_c_b">
                Album management
                <el-button type="primary" :icon="Plus" size="small" @click="operate('add')">add</el-button>
            </div>
        </template>
        <el-row class="album">
            <el-col style="padding: 10px" :xs="24" :sm="6" v-for="item in albumList" :key="item.id">
                <div class="album-card">
                    <div class="flex_c_b">
                        <div class="album-title" @click="operate('photos', item)">
                            <span :title="item.name">{{ item.name }}</span>
                            <el-icon>
                                <Paperclip />
                            </el-icon>
                        </div>
                        <div class="operate flex_c_b">
                            <el-icon color="#66b1ff" size="18" @click="operate('edit', item)">
                                <Edit />
                            </el-icon>
                            <el-popconfirm :title="`delete album-${item.name}?`" icon-color="#66b1ff"
                                @confirm="operate('delete', item.id)">
                                <template #reference>
                                    <el-icon color="#f56c6c" size="16" style="margin-left: 5px">
                                        <Delete />
                                    </el-icon>
                                </template>
                            </el-popconfirm>
                        </div>
                    </div>
                    <span :title="item.description" class="album-desc">{{
                        item.description
                    }}</span>
                    <el-image class="album-image animate__animated animate__fadeIn" :src="item.cover" fit="cover"
                        loading="lazy" preview-teleported :preview-src-list="[item.cover]" />
                </div>
            </el-col>
        </el-row>
        <el-pagination class="pagination" v-model:current-page="param.current" v-model:page-size="param.size"
            :page-sizes="[8, 12, 16]" :small="true" :disabled="false" :background="false"
            layout="total, sizes, prev, pager, next, jumper" :total="albumTotal" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        <el-dialog :title="albumForm.id ? 'Edit album' : 'Add ablum'" v-model="dialogVisible" :width="400"
            :before-close="closeDialog">
            <el-form ref="albumFormRef" :inline="true" :model="albumForm" :rules="albumFormRules" class=""
                label-width="100">
                <el-form-item class="form-item80" label="Name" prop="name">
                    <el-input v-model="albumForm.name" placeholder="please input album name" clearable maxlength="25" />
                </el-form-item>
                <el-form-item class="form-item80" label="Description" prop="description">
                    <el-input type="textarea" v-model="albumForm.description" placeholder="please input album description"
                        clearable maxlength="25" />
                </el-form-item>
                <el-form-item class="cover" label="Cover" prop="cover">
                    <Upload v-model:fileList="albumForm.coverList" :width="200" :height="200" :limit="1" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button size="small" @click="closeDialog()">cancel</el-button>
                <el-button size="small" type="danger" plain @click="submitForm(albumFormRef)">
                    save
                </el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import Upload from '@/components/Upload/index.vue'
import { Plus, Paperclip, Delete, Edit } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { deleteAlbum, getAlbum, patchAlbum, postAlbum } from '@/api/album';
import { ElLoading, ElMessage } from 'element-plus';
import { imgUpload } from '@/api/site';

const router = useRouter()

const albumList = ref([])
const albumTotal = ref(0)
const param = reactive({
    current: 1,
    size: 8,
    name: ""
})

const dialogVisible = ref(false)
const albumFormRef = ref()
const albumForm = reactive({
    id: "",
    name: "",
    description: "",
    cover: "",
    coverList: []
})
const primaryAlbumForm = reactive({ ...albumForm })
const coverV = (rule, value, cb) => {
    if (!albumForm.coverList.length) {
        return new Error("please input album cover");
    }
    cb();
}
const albumFormRules = reactive({
    album_name: {
        required: true,
        message: "please input album name",
        trigger: ["blur"]
    },
    description: {
        required: true,
        message: "please input album description",
        trigger: ["blur"]
    },
    album_cover: {
        required: true,
        validator: coverV,
        trigger: ["change"]
    }
})

const closeDialog = () => {
    albumFormRef.value.resetFields();
    Object.assign(albumForm, primaryAlbumForm);
    dialogVisible.value = false;
}

const pageGetAlbum = async () => {
    const res = await getAlbum({page: param.current, pageSize: param.size});
    if (res.data) {
        const { data, total } = res;
        albumList.value = data.map(l => {
            return {
                id: l.id,
                name: l.name,
                description: l.description,
                cover: l.cover,
                coverList: [
                    {
                        id: 1,
                        url: l.cover
                    }
                ]
            };
        });
        albumTotal.value = total;
    }
}

const handleSizeChange = val => {
    param.size = val
    pageGetAlbum()
}

const handleCurrentChange = val => {
    param.current = val
    pageGetAlbum()
}

const deleteAlbumById = async id => {
    const res = await deleteAlbum(id);
    if (res.affected == 1) {
        pageGetAlbum();
        ElMessage({
            showClose: true,
            message: 'Delete album success',
            type: 'success',
        })
    } else {
        ElMessage({
            showClose: true,
            message: 'Delete album error',
            type: 'error',
        })
    }
}

const operate = (type, val?) => {
    switch (type) {
        case "edit":
            Object.assign(albumForm, JSON.parse(JSON.stringify(val)));
            dialogVisible.value = true;
            break;
        case "delete":
            deleteAlbumById(val);
            break;
        case "photos":
            router.push({
                path: "/album/photoList",
                query: {
                    id: val.id,
                    albumName: val.name
                }
            });
            break;
        case "add":
            dialogVisible.value = true;
            break;
        default:
            return;
    }
}

const submitForm = async formEl => {
    if (!formEl) return;
    await formEl.validate(async valid => {
        if (valid) {
            if (!albumForm.coverList[0].id) {
                const upLoadLoading = ElLoading.service({
                    fullscreen: true,
                    text: "Photo updating"
                });
                const imgRes: any = await imgUpload(albumForm.coverList[0]);
                if (imgRes.code == 0) {
                    const { url } = imgRes;
                    albumForm.cover = url;
                }
                upLoadLoading.close();
            } else {
                albumForm.cover = albumForm.coverList[0].url;
            }

            let res;
            const { id, coverList, ...rest } = albumForm;
            if (albumForm.id) {
                res = await patchAlbum({id: +id, photos: coverList, ...rest});
            } else {
                res = await postAlbum({ photos: coverList, ...rest });
            }
            if (res.id) {
                ElMessage({
                    showClose: true,
                    message: 'Add album successfully',
                    type: 'success',
                })
                formEl.resetFields();
                pageGetAlbum()
                dialogVisible.value = false;
            } else if (res.affected && res.affected == 1) {
                ElMessage({
                    showClose: true,
                    message: 'Edit album successfully',
                    type: 'success',
                })
                formEl.resetFields();
                pageGetAlbum()
                dialogVisible.value = false;
            } else {
                ElMessage({
                    showClose: true,
                    message: 'Operate album error',
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
    });
}

onMounted(() => {
    pageGetAlbum()
})

</script>

<style lang='scss' scoped>
.flex_c_b {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.album {
  height: calc(100vh - 220px);
  overflow: auto;

  &-card {
    position: relative;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  }

  &-title {
    font-weight: 600;
    width: 70%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: all 0.5s;
    color: #606266;
    vertical-align: baseline;

    &:hover {
      cursor: pointer;
      color: #66b1ff;
    }
  }

  &-desc {
    font-size: 0.8em;
    display: inline-block;
    padding: 0px 10px;
    width: 95%;
    color: #606266;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &-image {
    vertical-align: bottom;
    width: 100%;
    position: relative;
    transition: all 0.5s;

    &:hover {
      cursor: pointer;
    }
  }
}

.operate {
  &:hover {
    cursor: pointer;
  }
}

.form-item {
  &50 {
    width: 50%;
    font-weight: bold;
  }

  &80 {
    width: 80%;
    font-weight: bold;
  }
}

.cover {
  font-weight: bold;

  :deep(.el-form-item__content) {
    width: 200px;
    height: 200px;
  }

  :deep(.el-upload-list__item) {
    width: 200px !important;
    height: 200px !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0;
  }

  :deep(.el-upload-list--picture-card) {
    width: 200px !important;
    height: 200px !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0;
  }

  :deep(.el-upload--picture-card) {
    width: 200px !important;
    height: 200px !important;
    border-radius: 0;
  }
}

@media screen and (max-width: 798px) {
  .album-image {
    height: 240px;
  }
}

@media screen and (min-width: 799px) {
  .album-image {
    height: 200px;
  }
}
</style>