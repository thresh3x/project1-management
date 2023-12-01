<template>
    <el-card class="box-card" shadow="never">
        <template #header>
            <div class="card-header">
                <span>User Management</span>
            </div>
        </template>
        <div class="table-header">
            <el-form :inline="true" :model="param" class="bg-bg_color w-[99/100]">
                <el-form-item label="Nickname: " prop="keyWord">
                    <el-input v-model="param.keyWord" placeholder="please input nickname" clearable class="!w-[180px]" />
                </el-form-item>
                <el-form-item label="User role: " prop="role">
                    <el-select v-model="param.role" placeholder="please select user role" clearable class="!w-[180px]">
                        <el-option label="manage" :value="1" />
                        <el-option label="normal" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="" :loading="loading" @click="onSearch">
                        search
                    </el-button>
                    <el-button icon="" @click="resetParam">
                        reset
                    </el-button>
                </el-form-item>
            </el-form>
            <el-space class="float-right mb-4">
                <el-radio-group v-model="tableSize" size="small">
                    <el-radio-button label="large">L</el-radio-button>
                    <el-radio-button label="default">M</el-radio-button>
                    <el-radio-button label="small">S</el-radio-button>
                </el-radio-group>
            </el-space>
        </div>
        <el-table border row-key="id" show-overflow-tooltip :size="tableSize" :lazy="true" :data="dataList"
            :height="tableSize === 'small' ? 350 : 400" style="width: 100%">
            <el-table-column type="index" width="50" />
            <el-table-column label="username" prop="username" />
            <el-table-column label="nickname" prop="nick_name" />
            <el-table-column label="avatar" width="100">
                <template #default="avatarScope">
                    <el-avatar :size="50" :src="avatarScope.row.avatar ||
                        'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                </template>
            </el-table-column>
            <el-table-column label="role" width="200">
                <template #default="roleScope">
                    <el-switch v-model="roleScope.row.role" size="small" :active-value="1" :inactive-value="2"
                        active-text="manage" inactive-text="normal" @change="roleChange(roleScope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="createAt" prop="createAt" />
            <el-table-column label="updateAt" prop="updateAt" />
            <el-table-column fixed="right" label="operations" width="200">
                <template #default="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(scope.row)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="table-footer">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10]"
                :small="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
        <el-dialog title="Edit the user" v-model="dialogVisible" :width="480" draggable :before-close="closeDialog">
            <el-form ref="userFormRef" :model="form" :rules="formRules" label-width="100px">
                <el-form-item label="Nickname" prop="nick_name">
                    <el-input v-model="form.nick_name" :style="{ width: '380px' }" placeholder="please input the nickname"
                        clearable />
                </el-form-item>
                <el-form-item class="user-avatar" label="Avatar">
                    <Upload v-model:fileList="form.avatarList" :width="80" :height="80" :limit="1" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="closeDialog">Cancel</el-button>
                <el-button type="primary" @click="submitForm(userFormRef)">
                    Ok
                </el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup lang='ts'>
import { deleteUser, getUser, getUserByRole } from '@/api/user';
import { User, FindAllRes } from '@/project1-libcommon';
import { useUserStore } from '@/stores/user';
import { saveUpdateUser } from '@/utils/saveUpdateUser';
import { ElLoading, ElMessage } from 'element-plus';
import { ref, reactive, watch } from 'vue'
import Upload from '@/components/Upload/index.vue'
import { imgUpload } from '@/api/site';

type TableSize = 'small' | 'large' | 'default'

const param = reactive({
    page: 1,
    pageSize: 5,
    keyWord: '',
    role: undefined
})
const primaryParam = reactive({ ...param })
const userFormRef = ref()
let dataList = ref<Partial<User>[]>([])
const loading = ref(false)
const tableSize = ref<TableSize>('small')
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(5)
const dialogVisible = ref<boolean>(false)
const form = reactive({
    id: "",
    nick_name: "",
    avatar: "",
    avatarList: []
})
const primaryForm = reactive({ ...form })
const formRules = reactive({
    nick_name: [{ required: true, message: "请输入昵称", trigger: "blur" }]
})

const getData = async (page: number, pageSize: number) => {
    const data: FindAllRes = await getUser({ page, pageSize })
    dataList.value = data.data
    total.value = data.total
}

const resetParam = () => {
    Object.assign(param, primaryParam)
    onSearch()
}

const onSearch = async () => {
    const { page, pageSize, keyWord, role } = param
    const res = await getUserByRole({
        page, pageSize, keyWord: keyWord || '', role: role || undefined
    })
    dataList.value = res.data
    total.value = res.total
    ElMessage({
        showClose: true,
        message: 'Search success',
        type: 'success',
    })
}

const handleEdit = (_, row) => {
    Object.assign(form, row)
    if (row.avatar) {
        form.avatarList = [
            {
                id: 1,
                url: row.avatar
            }
        ]
    }
    dialogVisible.value = true
}

const handleDelete = async (user) => {
    const res = await deleteUser(user.id)
    if (res.affected === 1) {
        ElMessage({
            showClose: true,
            message: 'Delete user success',
            type: 'success',
        })
        getData(currentPage.value, pageSize.value)
    } else {
        ElMessage({
            showClose: true,
            message: 'Delete user failed',
            type: 'error',
        })
    }
}

const roleChange = async (user: User) => {
    if (user.id) {
        const data: Partial<User> = {}
        data.role = user.role
        data.id = user.id
        await saveUpdateUser(data)
        useUserStore().SET_ROLE(user.role)
    }
}

const handleSizeChange = (val: number) => {
    pageSize.value = val
    param.pageSize = val
}
const handleCurrentChange = (val: number) => {
    currentPage.value = val
}

async function closeDialog() {
    await getData(currentPage.value, pageSize.value)
    Object.assign(form, primaryForm)
    dialogVisible.value = false
}

async function submitForm(formEl) {
    if (!formEl) return
    await formEl.validate(async valid => {
        if (valid) {
            if (form.avatarList.length) {
                if (!form.avatarList[0].id) {
                    const upLoadLoading = ElLoading.service({
                        fullscreen: true,
                        text: 'Avatar upload Loading'
                    })
                    const imgRes: any = await imgUpload(form.avatarList[0])
                    if (imgRes.code === 0) {
                        const { url } = imgRes
                        form.avatar = url
                    }
                    upLoadLoading.close()
                } else {
                    form.avatar = form.avatarList[0].url
                }
            } else {
                form.avatar = ''
            }
            const { id, nick_name, avatar } = form
            saveUpdateUser({ id: +id, nick_name, avatar })
        }
    })
}

watch(() => [currentPage.value, pageSize.value],
    () => {
        getData(currentPage.value, pageSize.value)
    },
    {
        immediate: true,

    })
</script>

<style lang='scss' scoped>
.table-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: self-start;
}

:deep(.el-table--small .cell) {
    display: flex;
    justify-content: center;
}

:deep(.el-table--default .cell) {
    display: flex;
    justify-content: center;
}

:deep(.el-table--large .cell) {
    display: flex;
    justify-content: center;
}

.user-avatar {
    margin-left: 30px;
    height: 80px;
    width: 80px;
    z-index: 999;

    :deep(.el-upload--picture-card) {
        width: 80px !important;
        height: 80px !important;
        border-radius: 40px !important;
    }

    :deep(.el-upload-list__item) {
        width: 80px !important;
        height: 80px !important;
        border-radius: 40px !important;
        margin: 0;
    }

    :deep(.el-upload-list--picture-card) {
        width: 80px !important;
        height: 80px !important;
        border-radius: 40px !important;
    }
}
</style>