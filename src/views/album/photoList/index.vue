<template>
    <el-card class="album">
        <el-tabs @tab-click="tabChange">
            <template v-for="item of photoTab" :key="item.key">
                <el-tab-pane :lazy="true">
                    <template #label>
                        <el-tooltip :content="item.content" placement="top-end">
                            <span>{{ item.title }}</span>
                        </el-tooltip>
                    </template>
                </el-tab-pane>
            </template>
        </el-tabs>
        <template #header>
            <div class="flex_r_b">
                <span style="font-weight: 600; color: #606266"> Album name - {{ currentAlbumName }}</span>
            </div>
            <div class="flex_r_b">
                <div></div>
                <div v-if="param.status == 1">
                    <template v-if="!isEdit">
                        <el-button type="primary" size="small" :icon="Plus" @click="add">Add</el-button>
                        <el-button type="success" size="small" :icon="EditPen" @click="edit">Edit</el-button>
                    </template>
                    <template v-else>
                        <el-button type="danger" size="small" :icon="CircleCheck" @click="deleteBatch">Delete
                            batch</el-button>
                        <el-button type="info" size="small" :icon="CircleCheck" @click="cancel">Cancel</el-button>
                    </template>
                </div>
                <div v-else>
                    <el-button type="danger" size="small" :icon="Delete" @click="deleteBatch">Delete batch</el-button>
                    <el-button type="success" size="small" :icon="RefreshLeft" @click="revertBatch">Rever batch</el-button>
                    <el-button type="info" size="small" :icon="ToiletPaper" @click="clear">Clear</el-button>
                </div>
            </div>
        </template>
        <div class="album-upload">
            <template v-if="!photoList.length">
                <el-empty />
            </template>
            <template v-else>
                <div class="retrieve-box" v-for="(item, index) in photoList" :key="item.id">
                    <el-checkbox class="retrieve-box__checkbox" v-model="item.checked"
                        v-if="(isEdit && param.status == 1) || param.status == 2" />
                    <el-image class="retrieve-box__img" fit="cover" :data-src="item.url" :src="item.url"
                        @click="showPreview(index)" />
                </div>
            </template>
        </div>
        <el-pagination class="pagination" v-model:current-page="param.current" v-model:page-size="param.size"
            :page-sizes="[50, 100, 200, 999]" :small="true" :disabled="false" :background="false"
            layout="total, sizes, prev, pager, next, jumper" :total="photoTotal" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        <el-image-viewer v-if="previewShow" :url-list="previewList" :initial-index="previewIndex" @close="closeImgViewer" />
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { Plus, EditPen, CircleCheck, Delete, RefreshLeft, ToiletPaper } from '@element-plus/icons-vue'
import { useStaticStore } from '@/stores/static';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { deletePhoto, patchPhoto } from '@/api/photo';
import { getOneAlbum } from '@/api/album';

const staticStore = useStaticStore()
const photoTab = staticStore.getPhotoTab
const route = useRoute()
const router = useRouter()
const photoList = ref([])
const photoTotal = ref(0)
const param = reactive({
    current: 1,
    size: 50,
    status: 1,
    id: null
})
const currentAlbumName = ref(null)
const isEdit = ref(false)

const previewShow = ref(false)
const previewList = ref([])
const previewIndex = ref(0)

const tabChange = async (val: any) => {
    param.status = val.index ? Number(val.index) + 1 : null
    let list = await pageGetPhoto()
    list = list.filter(item => item.status == param.status)
    const total = list.length
    photoList.value = list.map(l => {
        return {
            id: l.id,
            url: l.url,
            checked: false
        }
    })
    previewList.value = list.map(l => {
        return l.url
    })
    photoTotal.value = total
}

const deleteFunc = async (list) => {
    let res
    if (param.status == 1) {
        for (let i = 0; i < list.length; i++) {
            res = await patchPhoto({ id: list[i].id, status: 2 })
        }
    } else {
        for (let i = 0; i < list.length; i++) {
            console.log('delete');

            res = await deletePhoto(list[i].id)
        }
    }
    return res
}

const deleteBatch = async () => {
    const list = photoList.value.filter(p => p.checked)
    if (!list.length) {
        ElMessage({
            showClose: true,
            message: 'Please select the photo you want to delete',
            type: 'warning',
        })
        return
    }
    const res: any = await deleteFunc(list)
    console.log(res);

    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: 'Delete success',
            type: 'success',
        })
        isEdit.value = false
        pageGetPhoto()
    }
}

const clear = () => {
    const res: any = deleteFunc(photoList.value)
    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: 'Clear success',
            type: 'success',
        })
        pageGetPhoto()
    }
}

const revertBatch = () => {
    const list = photoList.value.filter(p => p.checked)
    if (!list.length) {
        ElMessage({
            showClose: true,
            message: 'Please select the photo you want to revert',
            type: 'warning',
        })
        return;
    }
    let res
    list.forEach(async item => {
        res = await patchPhoto({ id: item.id, status: 1 })
    })
    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: 'Revert success',
            type: 'success',
        })
        pageGetPhoto();
    }
}

const edit = () => {
    isEdit.value = true;
};

const add = () => {
    router.push({
        path: "/album/addPhotos",
        query: {
            id: param.id,
            albumName: currentAlbumName.value
        }
    })
}

const cancel = () => {
    isEdit.value = false
}

const showPreview = index => {
    previewIndex.value = index
    previewShow.value = true
}

const closeImgViewer = () => {
    previewShow.value = false
}

const handleSizeChange = val => {
    param.size = val
    pageGetPhoto()
}

const handleCurrentChange = val => {
    param.current = val
    pageGetPhoto()
}

const pageGetPhoto = async () => {
    const res = await getOneAlbum(param.id)
    if (res[0].id) {
        const list = res[0].photos
        const total = list.length
        photoList.value = list.map(l => {
            return {
                id: l.id,
                url: l.url,
                checked: false
            }
        })
        previewList.value = list.map(l => {
            return l.url
        })
        photoTotal.value = total
        return list
    }
}

onMounted(async () => {
    if (route.query.id && route.query.albumName) {
        const { id, albumName } = route.query;
        currentAlbumName.value = albumName;
        param.id = Number(id);
    }
    await pageGetPhoto();
});

</script>

<style lang='scss' scoped>
.album-upload {
    height: calc(100vh - 280px);
    overflow: auto;
}

.album-upload::-webkit-scrollbar {
    display: none;
}

:deep(.el-card__body) {
    padding: 5px 5px 0 5px !important;
}

.pagination {
    margin: 0 0 10px 10px;
}

.flex_r_b {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
}

.operate {
    width: 30%;

    &:hover {
        cursor: pointer;
    }
}

.retrieve-box {
    margin: 5px;
    width: 108px;
    height: 108px;
    position: relative;
    display: inline-block;

    &__checkbox {
        position: absolute;
        top: -3px;
        right: 5px;
    }

    &__img {
        width: 100%;
        height: 100%;
    }
}
</style>