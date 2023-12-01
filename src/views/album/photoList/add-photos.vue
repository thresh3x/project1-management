<template>
    <el-card>
        <template #header>
            <div class="flex_r_b">
                <span style="font-weight: 600; color: #606266">Album name - {{ currentAlbumName }}</span>
                <div>
                    <el-button type="danger" size="small" :icon="CircleCheck" @click="save">Save</el-button>
                    <el-button type="info" size="small" :icon="CircleCheck" @click="cancel">Cancel</el-button>
                </div>
            </div>
            <div class="tips">
                tips: Almost upload 9 photos and the total size can not be larger than 30M
            </div>
        </template>
        <div class="album-upload">
            <Upload v-model:fileList="imgUploadList" :limit="9" :width="108" :height="108" :multiple="true"
                :preview="false" />
        </div>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import Upload from '@/components/Upload/index.vue'
import { CircleCheck, } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router';
import { ElLoading, ElMessage } from 'element-plus';
import { conversion, imgUpload } from '@/api/site';
import { postPhoto } from '@/api/photo';
import { UploadType } from '@/project1-libcommon/index'
import { getOneAlbum } from '@/api/album';

const route = useRoute()
const router = useRouter()

const currentAlbumName = ref(null)
const currentAlbumId = ref(null)

const imgUploadList = ref([])

const cancel = () => {
    router.push({
        path: "/album/photoList",
        query: {
            id: currentAlbumId.value,
            albumName: currentAlbumName.value
        }
    })
}

const save = async () => {
    if (!currentAlbumId.value) {
        ElMessage({
            showClose: true,
            message: 'Please reselect album for upload',
            type: 'error',
        })
        return
    }
    // 上传图片
    const finalList = []
    // 批量压缩
    const conversionLoading = ElLoading.service({
        fullscreen: true,
        text: "photo compressing"
    })
    const conversionPromiseList = imgUploadList.value.map(async v => {
        return await conversion(v.raw)
    })

    const conversionUploadList = [];
    await Promise.all(conversionPromiseList).then(res => {
        res.map(raw => {
            conversionUploadList.push({ raw });
        })
    })
    conversionLoading.close();
    const imgUploading = ElLoading.service({
        fullscreen: true,
        text: "Uploading......"
    })
    const promiseList = conversionUploadList.map(async v => {
        return await imgUpload(v)
    });
    await Promise.all(promiseList).then(res => {
        res.map((img: UploadType) => {
            if (img.code == 0) {
                const { url } = img;
                finalList.push({
                    url: url
                });
            } else {
                ElMessage({
                    showClose: true,
                    message: 'Photo upload error',
                    type: 'error',
                })
            }
        });
    });
    imgUploading.close();
    const imgSaveLoading = ElLoading.service({
        fullscreen: true,
        text: "photos saving......"
    });
    let addPhotosRes: any
    let albumNow = await getOneAlbum(currentAlbumId.value)
    albumNow = albumNow[0]
    
    for(let i=0;i<finalList.length;i++) {
        addPhotosRes = await postPhoto({url: finalList[i].url, album: albumNow})
    }
    
    if (addPhotosRes.id) {
        ElMessage({
            showClose: true,
            message: 'Save success',
            type: 'success',
        })
    } else {
        ElMessage({
            showClose: true,
            message: 'Save error',
            type: 'error',
        })
        imgSaveLoading.close()
    }
    imgSaveLoading.close()

    router.push({
        path: "/album/photoList",
        query: {
            id: currentAlbumId.value,
            albumName: currentAlbumName.value
        }
    })
}

onMounted(() => {
    if (route.query.id && route.query.albumName) {
        currentAlbumName.value = route.query.albumName;
        currentAlbumId.value = route.query.id;
    }
})

</script>

<style lang='scss' scoped>
.flex_r_b {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
}

.album-upload {
  height: calc(100vh - 260px);
  overflow: auto;
}

.tips {
  font-size: 0.8rem;
  color: #f56c6c;
}

:deep(.el-card__body) {
  padding: 5px 5px 0 5px !important;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 108px !important;
  height: 108px !important;
  margin: 3px !important;
  border: none !important;
  border-radius: 0;
}

:deep(.el-upload--picture-card) {
  width: 108px !important;
  height: 108px !important;
  margin: 3px !important;
}

:deep(.el-upload-list__item-cover) {
  object-fit: cover !important;
}
</style>