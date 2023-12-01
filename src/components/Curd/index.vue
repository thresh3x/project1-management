<template>
    <el-card shadow="never">
        <template #header>
            <div class="card-header">{{ type }} Management</div>
        </template>
        <div class="table-header">
            <el-form :inline="true" :model="param">
                <el-form-item :label="type + ' name: '" prop="name">
                    <el-input v-model="param.name" :placeholder="'please input ' + type.toLocaleLowerCase() + ': '"
                        clearable class="!w-[160px]" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :icon="Search" :loading="loading" @click="onSearch">
                        search
                    </el-button>
                    <el-button :icon="Refresh" @click="resetParam">
                        reset
                    </el-button>
                </el-form-item>
            </el-form>
            <el-space>
                <el-radio-group v-model="tableSize" size="small">
                    <el-radio-button label="large">L</el-radio-button>
                    <el-radio-button label="default">M</el-radio-button>
                    <el-radio-button label="small">S</el-radio-button>
                </el-radio-group>
            </el-space>
        </div>
        <el-space class="space">
            <el-button type="danger" size="small" :icon="Delete" @click="deleteBatch">DeleteBatch</el-button>
            <el-button class="reset-margin" type="primary" size="small" :icon="CirclePlus"
                @click="updateData">Add</el-button>
        </el-space>
        <el-table border row-key="id" show-overflow-tooltip :size="tableSize" :lazy="true" :data="dataList"
            @selection-change="handleSelectionChange" :height="tableSize === 'small' ? 350 : 400" style="width: 100%">
            <el-table-column type="selection" width="50" />
            <el-table-column type="index" label="id" width="50" />
            <el-table-column :label="type + ' name'" prop="name" />
            <el-table-column label="CreatedAt" prop="createdAt" />
            <el-table-column label="UpdateAt" prop="updateAt" />
            <el-table-column fixed="right" label="operations" width="200">
                <template #default="scope">
                    <el-button size="small" @click="updateData(scope.row)">Edit</el-button>
                    <el-button size="small" type="danger" @click="deleteData(scope.row)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="table-footer">
            <el-pagination v-model:current-page="param.current" v-model:page-size="param.size" :page-sizes="[5, 10]"
                :small="true" layout="total, sizes, prev, pager, next, jumper" :total="param.total"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
        <el-dialog :title="form.id ? 'Edit ' + type : 'Add ' + type" v-model="dialogVisible" :width="480" draggable
            :before-close="closeDialog">
            <el-form ref="dialogFormRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item :label="type + ' name'" prop="name">
                    <el-input v-model="form.name" :style="{ width: '380px' }" :placeholder="'please input ' + type + ': '"
                        clearable />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="closeDialog">Cancel</el-button>
                <el-button type="primary" @click="submitForm(dialogFormRef)">
                    Ok
                </el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { Delete, CirclePlus, Search, Refresh } from '@element-plus/icons-vue'
import { deleteTag, getTag, patchTag, postTag } from '@/api/tag';
import { Query } from '@/project1-libcommon';
import { deleteCategory, getCategory, patchCategory, postCategory } from '@/api/category';
import { ElMessage } from 'element-plus';

type TableSize = 'small' | 'large' | 'default'

const props = withDefaults(defineProps<{
    type: "Tag" | "Category"
}>(), {
    type: "Tag"
})

const param = reactive({
    name: '',
    current: 1,
    size: 5,
    total: 0,
})
const form = reactive({
    id: "",
    name: ""
})
const tableSize = ref<TableSize>("small")
const primaryParam = reactive({ ...param })
const primaryForm = reactive({ ...form })
const loading = ref<boolean>(false)
const dataList = ref([])
const multipleSelection = ref([])
const dialogVisible = ref(false)
const dialogFormRef = ref()

function handleSelectionChange(val: any[]) {
    multipleSelection.value = val
}

async function getPageList() {
    const query: Query = {}
    query.keyWord = param.name
    query.page = param.current
    query.pageSize = param.size
    const res2 = await getTag(query)
    console.log(res2);
    const res = props.type == 'Tag' ? await getTag(query) : await getCategory(query)
    
    if (res.data) {
        dataList.value = res.data
        param.total = res.total
    } else {
        ElMessage({
            showClose: true,
            message: 'Get data error',
            type: 'error',
        })
    }
}

function onSearch() {
    getPageList()
}

function resetParam() {
    Object.assign(param, primaryParam)
    onSearch()
}

function closeDialog() {
    Object.assign(form, primaryForm)
    dialogVisible.value = false
}

const rules = reactive({
    name: [{ required: true, message: "please input name", trigger: "blur" }]
})

async function deleteBatch() {
    if (multipleSelection.value.length) {
        const list = multipleSelection.value.map(v => v.id)
        // delete use id list
        console.log(list);
        
        const res = props.type == 'Tag' ? await deleteTag(list) : await deleteCategory(list)
        if (res.code) {
            ElMessage({
                showClose: true,
                message: 'Delete success',
                type: 'success',
            })
            getPageList()
        } else {
            ElMessage({
                showClose: true,
                message: 'Delete error',
                type: 'error',
            })
        }
    } else {
        ElMessage({
            showClose: true,
            message: 'please choose first',
            type: 'warning',
        })
    }
}

async function updateData(row) {
    dialogVisible.value = true
    if (row) {
        Object.assign(form, row)
    }
}

async function deleteData(row) {
    console.log(row.id);
    
    const res = props.type == 'Tag' ? await deleteTag([row.id]) : await deleteCategory([row.id])
    if (res.code) {
        ElMessage({
            showClose: true,
            message: 'Delete success',
            type: 'success',
        })
        getPageList()
    } else {
        ElMessage({
            showClose: true,
            message: 'Delete error',
            type: 'error',
        })
    }
}

const handleSizeChange = (val) => {
    if (typeof val == 'number') {
        param.size = val
        getPageList()
    }
}

const handleCurrentChange = (val) => {
    param.current = val
    getPageList()
}

const resetForm = (formEl) => {
    if (!formEl) return
    formEl.resetFields()
}

async function submitForm(formEl) {
    if (!formEl) return
    await formEl.validate(async valid => {
        if (valid) {
            let res
            if (form.id) {
                // patch data
                console.log(form);
                
                res = props.type == 'Tag' ? await patchTag({ id: +form.id, name: form.name }) : await patchCategory({ id: +form.id, name: form.name })
            } else {
                res = props.type == 'Tag' ? await postTag({ name: form.name }) : await postCategory({ name: form.name })
            }
            if (res.id || res.affected == 1) {
                ElMessage({
                    showClose: true,
                    message: `${form.id ? "Patch" : "Add"} success`,
                    type: 'success',
                })
                dialogVisible.value = false
                resetForm(formEl)
                Object.assign(form, primaryForm)
                getPageList()
            } else {
                ElMessage({
                    showClose: true,
                    message: `${form.id ? "Patch" : "Add"} error`,
                    type: 'error',
                })
            }
        }
    })
}

onMounted(() => {
    getPageList()
})

</script>

<style lang='scss' scoped>
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: self-start;
}

.table-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.space {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
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

</style>