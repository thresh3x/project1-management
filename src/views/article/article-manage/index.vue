<template>
    <el-card shadow="never">
        <template #header>
            <div class="card-header">Article Management</div>
        </template>
        <div class="table-header">
            <el-form :inline="true" :model="param">
                <el-form-item label="Article title: " prop="title">
                    <el-input v-model="param.title" placeholder="please input article title" clearable />
                </el-form-item>
                <el-form-item label="Article category: " prop="categoryId">
                    <el-select v-model="param.categoryId" placeholder="please select article category" clearable>
                        <el-option v-for="(item, index) in categoryOptionList" :key="index" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Article tags: " prop="tag">
                    <el-select v-model="param.tagId" placeholder="please select article tag" clearable>
                        <el-option v-for="(item, index) in tagOptionList" :key="index" :label="item.name"
                            :value="item.id" />
                    </el-select>
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
        <div style="display: flex;">
            <el-form-item label="If top: ">
                <el-select v-model="param.isTop" placeholder="please select if top" clearable>
                    <el-option label="yes" value="1" />
                    <el-option label="no" value="2" />
                </el-select>
            </el-form-item>
            <el-form-item label="Publish time: " style="margin-left: 50px; ">
                <el-date-picker v-model="param.time" type="daterange" placeholder="please select publish time"
                    range-separator="to" start-placeholder="start time" end-placeholder="end time"
                    value-format="YYYY-MM-DD" />
            </el-form-item>
        </div>
        <el-space class="header-two">
            <el-form-item>
                <el-button type="primary" :icon="Search" :loading="loading" @click="onSearch">
                    search
                </el-button>
                <el-button :icon="Refresh" @click="resetParam">
                    reset
                </el-button>
            </el-form-item>
            <el-button type="primary" size="small" :icon="Plus" @click="addArticle">Add</el-button>
        </el-space>
        <el-tabs @tab-click="tabChange">
            <template v-for="item of articleTab" :key="item.key">
                <el-tab-pane :lazy="true">
                    <template #label>
                        <el-tooltip :content="item.content" placement="top-end">
                            <span>{{ item.title }}</span>
                        </el-tooltip>
                    </template>
                </el-tab-pane>
            </template>
        </el-tabs>
        <el-table border row-key="id" show-overflow-tooltip :size="tableSize" :lazy="true" :data="dataList"
            :height="tableSize === 'small' ? 350 : 400" style="width: 100%">
            <el-table-column type="index" width="50" />
            <el-table-column label="Article title" prop="title" />
            <el-table-column label="Article description" prop="description" min-width="130" />
            <el-table-column label="Category">
                <template #default="categoryScope">
                    <el-tag>{{ categoryScope.row.category.name }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Tag" resizable min-width="200">
                <template #default="tagScope">
                    <el-tag v-for="tag in tagScope.row.tags" style="margin-left: 5px;">{{ tag.name }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Cover" width="200">
                <template #default="coverScope">
                    <el-avatar :src="coverScope.row.cover ||
                        'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                </template>
            </el-table-column>
            <el-table-column label="If top">
                <template #default="topScope">
                    <el-switch v-model="topScope.row.isTop" size="small" :active-value="1" :inactive-value="2"
                        @change="changeTop(topScope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="Status">
                <template #default="statusScope">
                    {{ statusScope.row.status == 1 ? "open" : statusScope.row.status == 2 ? "hide" : "draft" }}
                </template>
            </el-table-column>
            <el-table-column label="CreatedAt" width="130">
                <template #default="timeScope">
                    {{ formatDate(new Date(timeScope.row.createdAt)) }}
                </template>
            </el-table-column>
            <el-table-column label="UpdateAt" width="130">
                <template #default="timeScope">
                    {{ formatDate(new Date(timeScope.row.updateAt)) }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="operations" width="200">
                <template #default="scope">
                    <el-button size="small" @click="editArticle(scope.row)">Edit</el-button>
                    <el-popconfirm v-if="[1, 2].includes(Number(scope.row.status))"
                        :title="`Are you sure ${scope.row.status == 1 ? 'hide' : 'open'} article?`" icon-color="#66b1ff"
                        @confirm="changeArticlePublic(scope.row)">
                        <template #reference>
                            <el-button link type="success" size="small" :icon="scope.row.status == 1 ? Hide : View
                                ">
                                {{ scope.row.status == 1 ? "Hide" : "Open" }}
                            </el-button>
                        </template>
                    </el-popconfirm>
                    <el-popconfirm :title="`Are you sure to delete ${scope.row.title}?`" icon-color="#66b1ff"
                        @confirm="deleteArticleById(scope.row.id, scope.row.status, scope.row.title)">
                        <template #reference>
                            <el-button class="reset-margin" link type="danger" size="small" :icon="Delete">
                                Delete
                            </el-button>
                        </template>
                    </el-popconfirm>
                    <el-popconfirm v-if="scope.row.status == 3" :title="`Are you sure to open ${scope.row.title}?`"
                        icon-color="#66b1ff" @confirm="revertArticleById(scope.row.id, scope.row.title)">
                        <template #reference>
                            <el-button class="reset-margin" link type="success" size="small" :icon="EditPen">
                                Open
                            </el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <div class="table-footer">
            <el-pagination v-model:current-page="param.current" v-model:page-size="param.size" :page-sizes="[5, 10]"
                :small="true" layout="total, sizes, prev, pager, next, jumper" :total="param.total"
                @size-change="onSizeChange" @current-change="onCurrentChange" />
        </div>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Hide, View, Delete, EditPen } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { useStaticStore } from '@/stores/static'
import { getArticle, patchArticle, deleteArticle } from '@/api/article';
import { ElMessage } from 'element-plus';
import { getTag } from '@/api/tag';
import { getCategory } from '@/api/category';
import { formatDate } from '@/utils/formatDate';
import { Article } from '@/project1-libcommon';
import { compareDate } from '@/utils/compareDate';

type TableSize = 'small' | 'large' | 'default'

const router = useRouter()
const staticStore = useStaticStore()
const param = reactive({
    current: 1,
    size: 5,
    title: '',
    tagId: null,
    categoryId: null,
    isTop: null,
    status: null,
    time: null,
    total: 0
})
const primaryParam = reactive({ ...param })
const categoryOptionList = ref([])
const tagOptionList = ref([])
const tableSize = ref<TableSize>("small")
const tableImageList = ref([])
const dataList = ref([])
const loading = ref(false)
const articleTab = staticStore.getArticleTab

function onSearch() {
    pageGetArticleList()
}

function resetParam() {
    Object.assign(param, primaryParam)
    pageGetArticleList()
}

function addArticle() {
    router.push({ path: "/article/addArticle" });
}

const tabChange = (val: any) => {
    param.status = val.index ? Number(val.index) : null;
    pageGetArticleList();
}

function editArticle(row) {
    router.push({ path: "/article/editArticle", query: { articleId: row.id } });
}

function onSizeChange(val) {
    param.size = val;
    pageGetArticleList();
}

function onCurrentChange(val) {
    if (typeof val == "number") {
        param.current = val;
        pageGetArticleList();
    }
}

async function changeTop(val) {
    if (val) {
        const { id, isTop } = val;
        const res = await patchArticle(val);
        if (res.affected == 1) {
            ElMessage({
                showClose: true,
                message: `${isTop == 1 ? "Top" : "Cancel top"} success`,
                type: 'success',
            })
        }
    }
}

async function changeArticlePublic(val) {
    let { status } = val
    val.status = status == 1 ? 2 : 1
    const res = await patchArticle(val)

    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: `${status == 1 ? "Hide" : "Open"} success`,
            type: 'success',
        })
    }
    pageGetArticleList();
}

async function revertArticleById(id, title) {
    if (id) {
        const res = await patchArticle(id);
        if (res.affected == 1) {
            ElMessage({
                showClose: true,
                message: `Open ${title} success`,
                type: 'success',
            })
        }
        pageGetArticleList();
    }
}

async function deleteArticleById(id, status, title) {
    const res = await deleteArticle(id);
    if (res.affected == 1) {
        if (status == 3) {
            ElMessage({
                showClose: true,
                message: `Delete article ${title} success`,
                type: 'success',
            })
        } else {
            ElMessage({
                showClose: true,
                message: `Article ${title} had been recycle bin`,
                type: 'success',
            })
        }
        pageGetArticleList();
    }
}

async function pageGetArticleList() {
    loading.value = true;
    const res = await getArticle({ keyWord: param.title, page: param.current, pageSize: param.size });
    if (res.data) {
        let data: Article[] = res.data
        if (param.categoryId) {
            data = data.filter(item => item.category.id == param.categoryId)
        }
        if (param.tagId) {
            data = data.filter(item => item.tags.find(v => v.id == param.tagId))
        }
        if (param.isTop) {
            data = data.filter(item => item.isTop == param.isTop)
        }
        if (param.time) {
            const start = param.time[0]
            const end = param.time[1]
            data = data.filter(item => compareDate(item.createdAt, start) && compareDate(end, item.createdAt))
        }
        if (param.status) {
            data = data.filter(item => item.status == param.status)
        }
        dataList.value = data;
        param.total = res.total;
        tableImageList.value = dataList.value.map(v => {
            return v.cover;
        });
    }
    loading.value = false;
}

async function getTagD() {
    const res = await getTag({ keyWord: '', page: 1, pageSize: 100 });
    if (res.data) {
        tagOptionList.value = res.data;
    }
}
async function getCategoryD() {
    const res = await getCategory({ keyWord: '', page: 1, pageSize: 100 });
    if (res.data) {
        categoryOptionList.value = res.data;
    }
}

onMounted(async () => {
    await pageGetArticleList();

    await getCategoryD();
    await getTagD();
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

.header-two {
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
</style>