<template>
    <el-card>
        <template #header>
            <div class="">
                Background management
                <el-button type="primary" :icon="Plus" size="small" @click="operate('add')">新增</el-button>
            </div>
            <div class="tip">
                Background management is used for blog site to manage header background of every page.<br />
                Route name is the page of "route.name". Background list is in the "routerList.ts" to maintenance. You need
                add router in the ts file.
            </div>
        </template>
        <el-row class="page-header">
            <el-col style="padding: 10px" :xs="24" :sm="6" v-for="item in pageHeaderList" :key="item.id">
                <div class="page-header-card">
                    <div class="">
                        <div class="operate">
                            <el-icon color="#66b1ff" size="18" @click="operate('edit', item)">
                                <Edit />
                            </el-icon>
                            <el-popconfirm :title="`Delete background-${item.route_name}?`" icon-color="#66b1ff"
                                @confirm="operate('delete', item)">
                                <template #reference>
                                    <el-icon color="#f56c6c" size="16" style="margin-left: 5px">
                                        <Delete />
                                    </el-icon>
                                </template>
                            </el-popconfirm>
                        </div>
                        <div class="page-header-title">
                            <span class="">Page name: </span>
                            <span :title="item.page_name">{{ item.page_name }}</span>
                        </div>
                        <div class="page-header-title">
                            <span class="">Router: </span>
                            <span :title="item.route_name">{{ item.route_name }}</span>
                        </div>
                    </div>
                    <el-image class="page-header-image animate__animated animate__fadeIn" :src="item.bg_url" fit="cover"
                        loading="lazy" preview-teleported :preview-src-list="item.coverList.map(v => v.url)" />
                </div>
            </el-col>
        </el-row>
        <el-dialog :title="pageHeaderForm.id ? 'Edit background' : 'Add background'" v-model="dialogVisible" :width="400"
            :before-close="closeDialog">
            <el-form ref="pageHeaderFormRef" :inline="true" :model="pageHeaderForm" :rules="pageHeaderFormRules" class=""
                label-width="100">
                <el-form-item class="form-item80" label="Page name">
                    <el-select v-model="pageHeaderForm.page_name" placeholder="please select page name" clearable
                        maxlength="25" @change="changePageName">
                        <el-option v-for="item in optionList" :key="item.value" :label="item.label" :value="item.value"
                            :disabled="item.disabled" />
                    </el-select>
                </el-form-item>
                <el-form-item class="form-item80" label="Route" prop="route_name">
                    <el-input v-model="pageHeaderForm.route_name" placeholder="please input route name" clearable
                        maxlength="25" disabled />
                </el-form-item>
                <el-form-item class="cover" label="Cover" prop="pageHeader_cover">
                    <Upload v-model:fileList="pageHeaderForm.coverList" :width="200" :height="200" :limit="1" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button size="small" @click="closeDialog()">Cancel</el-button>
                <el-button size="small" type="danger" plain @click="submitForm(pageHeaderFormRef)">
                    Save
                </el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import Upload from '@/components/Upload/index.vue'
import { ElLoading, ElMessage } from 'element-plus';
import { imgUpload } from '@/api/site';
import { routerList } from './routerList.ts'
import { Plus } from '@element-plus/icons-vue'

const pageHeaderList = ref([])
const dialogVisible = ref(false)
const pageHeaderFormRef = ref()
const pageHeaderForm = reactive({
    id: "",
    route_name: "",
    bg_url: "",
    page_name: "",
    coverList: []
})
const optionList = ref(routerList)
const primaryPageHeaderForm = reactive({ ...pageHeaderForm })

const coverV = (rule, value, cb) => {
    if (!pageHeaderForm.coverList.length) {
        return new Error("Please upload background");
    }
    cb();
}

const pageHeaderFormRules = reactive({
    route_name: {
        required: true,
        message: "please input route name",
        trigger: ["blur"]
    },
    pageHeader_cover: {
        required: true,
        validator: coverV,
        trigger: ["change"]
    }
})

const closeDialog = () => {
    pageHeaderFormRef.value.resetFields();
    Object.assign(pageHeaderForm, primaryPageHeaderForm);
    dialogVisible.value = false;
}

const submitForm = async formEl => {
    if (!formEl) return
    await formEl.validate(async valid => {
        if (valid) {
            // first upload pic
            if (!pageHeaderForm.coverList[0].id) {
                const upLoadLoading = ElLoading.service({
                    fullscreen: true,
                    text: "Uploading"
                });
                const imgRes = await imgUpload(pageHeaderForm.coverList[0])
                if (imgRes.code == 0) {
                    const { url } = imgRes.result
                    pageHeaderForm.bg_url = url
                }
                upLoadLoading.close()
            } else {
                pageHeaderForm.bg_url = pageHeaderForm.coverList[0].url
            }

            const res = await addOrUpdatePageHeader(pageHeaderForm)
            if (res.code == 0) {
                await pageGetPageHeader();
                ElMessage({
                    showClose: true,
                    message: `${pageHeaderForm.id ? "Edit" : "Add"} success`,
                    type: 'success',
                })
                formEl.resetFields()
                Object.assign(pageHeaderForm, primaryPageHeaderForm)
                dialogVisible.value = false
            }
        }
    })
}

const operate = (type, val?) => {
    switch (type) {
        case "edit":
            Object.assign(pageHeaderForm, cloneDeep(val));
            dialogVisible.value = true;
            break;
        case "delete":
            deletePageHeaderById(val.id, val.bg_url);
            break;
        case "add":
            dialogVisible.value = true;
            break;
        default:
            return;
    }
}

const deletePageHeaderById = async (id, url) => {
    const res = await deletePageHeader({ id, url })
    if (res.code == 0) {
        pageGetPageHeader()
        ElMessage({
            showClose: true,
            message: `Delete success`,
            type: 'success',
        })
    }
}

const findPageName = name => {
    const index = routerList.findIndex(item => item.value == name);
    if (index == -1) {
        return;
    }
    return routerList[index].label;
}

const changePageName = val => {
    if (val) {
        const index = optionList.value.findIndex(op => op.value == val)
        if (index != -1) {
            optionList.value[index].disabled = true
        }
    } else {
        const index = optionList.value.findIndex(
            op => op.value == pageHeaderForm.route_name
        )
        if (index != -1) {
            optionList.value[index].disabled = false
        }
    }
    pageHeaderForm.route_name = val
}

const pageGetPageHeader = async () => {
    const res = await getPageHeaderList()
    if (res.code == 0) {
        pageHeaderList.value = res.result.map(l => {
            return {
                id: l.id,
                route_name: l.route_name,
                page_name: findPageName(l.route_name),
                bg_url: l.bg_url,
                coverList: [
                    {
                        id: 1,
                        url: l.bg_url
                    }
                ]
            }
        })
        optionList.value.forEach(op => {
            const index = pageHeaderList.value.findIndex(
                page => page.route_name == op.value
            )
            if (index != -1) {
                op.disabled = true
            } else {
                op.disabled = false
            }
        })
    }
}

onMounted(() => {
  pageGetPageHeader()
})
</script>

<style lang='scss' scoped></style>