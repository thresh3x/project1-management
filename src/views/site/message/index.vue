<template>
    <el-card shadow="never">
        <template #header>
            <div class="card-header">Message management</div>
        </template>
        <el-space class="">
            <el-radio-group v-model="tableSize" size="small">
                <el-radio-button label="large">L</el-radio-button>
                <el-radio-button label="default">M</el-radio-button>
                <el-radio-button label="small">S</el-radio-button>
            </el-radio-group>
        </el-space>
        <el-form :inline="true" :model="param" class="">
            <el-form-item label="Message content: " prop="message">
                <el-input v-model="param.message" placeholder="please input message content" clearable />
            </el-form-item>
            <el-form-item label="Message time: " prop="time">
                <el-date-picker v-model="param.time" type="daterange" placeholder="please select time range"
                    range-separator="to" start-placeholder="begin time" end-placeholder="end time" value-format="YYYY-MM-DD"
                    clearable />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="Search" :loading="loading" @click="onSearch">
                    Search
                </el-button>
                <el-button :icon="Refresh" @click="resetParam">
                    Refresh
                </el-button>
            </el-form-item>
        </el-form>
        <el-space class="">
            <el-button type="danger" size="small" :icon="Delete" @click="deleteBatch">DeleteBatch</el-button>
        </el-space>
        <el-table border row-key="id" show-overflow-tooltip :size="tableSize" :lazy="true" :data="dataList"
            :height="tableSize === 'small' ? 350 : 400" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="index" width="50" />
            <el-table-column label="nickname" prop="nick_name" />
            <el-table-column label="avatar" width="100">
                <template #default="avatarScope">
                    <el-avatar :size="50" :src="avatarScope.row.avatar ||
                        'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                </template>
            </el-table-column>
            <el-table-column label="Content" prop="message" />
            <el-table-column label="Date" prop="time" />
        </el-table>
        <div class="table-footer">
            <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                :page-sizes="pagination.pageSizes" :small="true" layout="total, sizes, prev, pager, next, jumper"
                :total="pagination.total" @size-change="onSizeChange" @current-change="onCurrentChange" />
        </div>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteMessage, getMessage } from '@/api/message';

type TableSize = 'small' | 'large' | 'default'

const param = reactive<any>({
    current: 1,
    size: 10,
    time: "",
    message: ""
})
const primaryParam = reactive({ ...param })
const dataList = ref([])
const loading = ref(false)
const tableSize = ref<TableSize>("small")
const selectList = ref<any>([])

const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    pageSizes: [10, 15, 20],
    total: 0,
})

function onSearch() {
    getPageMessageList();
}

const resetParam = () => {
    Object.assign(param, primaryParam);
    onSearch();
};

function handleSelectionChange(val) {
    selectList.value = val;
}

function onSizeChange(val) {
    param.size = val;
    getPageMessageList();
}

async function onCurrentChange(val) {
    if (typeof val == "number") {
        param.current = val;
        loading.value = true;
        getPageMessageList();
    }
}

function deleteBatch() {
    if (selectList.value.length) {
        ElMessageBox.confirm("Confirm delete", "Tip", {
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel"
        }).then(async () => {
            const list = selectList.value.map(se => se.id)
            const res = await deleteMessage({ idList: list })
            if (res.code == 0) {
                ElMessage({
                    showClose: true,
                    message: 'Delete batch success',
                    type: 'success',
                })
                getPageMessageList()
            } else {
                ElMessage({
                    showClose: true,
                    message: 'Delete batch error',
                    type: 'error',
                })
            }
        })
    } else {
        ElMessage({
            showClose: true,
            message: 'Please select message first',
            type: 'warning',
        })
    }
}

async function getPageMessageList() {
    const res = await getMessage(param)
    if (res.code == 0) {
        dataList.value = res.result.list
        pagination.total = res.result.total
        loading.value = false
    } else {
        loading.value = false
        ElMessage({
            showClose: true,
            message: 'Get message error',
            type: 'error',
        })
    }
}

onMounted(() => {
    getPageMessageList()
})

</script>

<style lang='scss' scoped></style>