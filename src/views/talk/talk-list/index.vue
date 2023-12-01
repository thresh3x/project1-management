<template>
    <el-card class="talk-card">
        <template #header>
            <div class="header">
                Talk list
                <el-button type="danger" size="small" :icon="Plus" @click="publishTalk">
                    Publish talk
                </el-button>
            </div>
        </template>
        <el-tabs @tab-click="tabChange">
            <template v-for="item of talkTab" :key="item.key">
                <el-tab-pane :lazy="true">
                    <template #label>
                        <el-tooltip :content="item.content" placement="top-end">
                            <span>{{ item.title }}</span>
                        </el-tooltip>
                    </template>
                </el-tab-pane>
            </template>
        </el-tabs>
        <el-card class="talk-list" v-for="(talk, index) in talkList"
            :key="talk.id">
            <template #header>
                <div class="header">
                    <div>
                        <img v-if="talk.status == 1 && talk.is_top == 1" class="toTop" src="../../../assets/svg/toTop.svg"/>
                    </div>
                    <el-dropdown @command="val => {
                        handleCommand(val, talk);
                    }
                        ">
                        <span class="el-dropdown-link">
                            <el-icon class="el-icon--right">
                                <ArrowDown />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-if="[1, 2].includes(talk.status)" command="edit">Edit</el-dropdown-item>
                                <el-dropdown-item v-if="talk.status == 1" command="toggleTop">{{
                                    talk.is_top == 1 ? "Cancel top" : "Be top"
                                }}</el-dropdown-item>
                                <el-dropdown-item v-if="[1, 2].includes(talk.status)" command="togglePublic">{{ talk.status
                                    == 1 ? "Hide" : "Open" }}</el-dropdown-item>
                                <el-dropdown-item v-if="talk.status == 3" command="revert">Revert talk</el-dropdown-item>
                                <el-dropdown-item command="delete">Delete</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </template>
            <div class="talk-header">
                <el-avatar class="talk-header__left" :size="40" :src="talk.avatar || avatar" shape="square" />
                <div class="talk-header__right">
                    <span class="nick-name">{{ talk.nick_name || nickName }}</span>
                    <TextOverflow class="" :text="talk.content" :width="199" :maxLines="8" :font-size="13" style="margin-top: 10px; margin-left: 5px;">
                        <template v-slot:default="{ clickToggle, expanded }">
                            <button @click="clickToggle" class="btn">
                                {{ expanded ? "Fold" : "Expand" }}
                            </button>
                        </template>
                    </TextOverflow>
                </div>
            </div>
            <div class="talk-img" v-if="Array.isArray(talk.talkImgList) && talk.talkImgList.length > 1">
                <el-image v-for="(item, index) in talk.talkImgList" :key="index" :src="item.url" style="width: 80px;height: 80px;"
                    loading="lazy" preview-teleported :initial-index="index" fit="cover"
                    :preview-src-list="talk.talkImgList.map(v => v)" />
            </div>
            <div class="talk-img-one" v-else-if="Array.isArray(talk.talkImgList) && talk.talkImgList.length == 1
                ">
                <el-image :key="index" :src="talk.talkImgList[0].url" style="width: 120px;height: 120px;" loading="lazy"
                    preview-teleported :initial-index="index" fit="cover"
                    :preview-src-list="talk.talkImgList.map(v => v)" />
            </div>
            <div class="time">{{ returnTime(talk.createdAt) }} before</div>
        </el-card>
        <div class="observer">
            {{ talkList.length >= total ? "No more" : "drop down to more" }}
        </div>
    </el-card>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useStaticStore } from '@/stores/static';
import { deleteTalk, getTalk, patchTalk } from '@/api/talk';
import { ElMessage, ElMessageBox } from 'element-plus';
import TextOverflow from '@/components/TextOverflow/index.vue'

const router = useRouter()
const userStore = useUserStore()

const avatar = userStore.getAvatar
const nickName = userStore.getNickName

const param = reactive({
    current: 1,
    size: 5,
    status: 1
})

const talkList = ref([])
const total = ref(0)
let observe
const talkTab = useStaticStore().getTalkTab

const tabChange = async (val: any) => {
    param.status = val.index ? Number(val.index) + 1 : null
    param.current = 1
    await pageGetTalkList()
    if (talkList.value.length < total.value) {
        observeTalkBottom()
    }
}

const pageGetTalkList = async (e?) => {
    const res = await getTalk({ page: param.current, pageSize: param.size })
    
    if (res.total) {
        talkList.value =
            param.current == 1
                ? res.data
                : talkList.value.concat(res.data)
        if (param.status) {
            talkList.value = talkList.value.filter(item => item.status == param.status)
        }
        console.log(talkList.value);
        
        total.value = res.total
        
        if (e && talkList.value.length >= total.value) {
            observe.unobserve(e.target) //stop observe
        }
    }
}

const toggleP = async (id, status) => {
    const res = await patchTalk({ id, status: status == 1 ? 2 : 1 })
    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: `${status == 1 ? "Hide" : "Open"} talk success`,
            type: 'success',
        })
        pageGetTalkList()
    } else {
        ElMessage({
            showClose: true,
            message: `${status == 1 ? "Hide" : "Open"} talk error`,
            type: 'error',
        })
    }
}

const toggleT = async (id, is_top) => {
    const res = await patchTalk({id, is_top:is_top == 1 ? 2 : 1})
    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: `${is_top == 1 ? "Cancel top" : "Top"} success`,
            type: 'success',
        })
        pageGetTalkList()
    } else {
        ElMessage({
            showClose: true,
            message: `${is_top == 1 ? "Cancel top" : "Top"} error`,
            type: 'error',
        })
    }
}

const revertT = async id => {
    const res = await patchTalk({id, status: 1})
    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: `Revert success`,
            type: 'success',
        })
        pageGetTalkList();
    } else {
        ElMessage({
            showClose: true,
            message: `Revert error`,
            type: 'error',
        })
    }
}

const deleteT = async (id, status) => {
    let res
    if (status == 3) {
        res = await deleteTalk(id)
    } else {
        res = await patchTalk({id, status: 3})
    }
    if (res.affected == 1) {
        ElMessage({
            showClose: true,
            message: `${status == 3 ? "Totally delete success" : "Talk has been recycle bin"}`,
            type: 'success',
        })
        param.current = 1
        pageGetTalkList()
    } else {
        ElMessage({
            showClose: true,
            message: `${status == 3 ? "Totally delete error" : "Talk has been recycle bin"}`,
            type: 'error',
        })
    }
}

const handleCommand = async (command, talk) => {
    switch (command) {
        case "toggleTop":
            toggleT(talk.id, talk.is_top);
            break;
        case "togglePublic":
            toggleP(talk.id, talk.status);
            break;
        case "revert":
            revertT(talk.id);
            break;
        case "edit":
            edit(talk.id);
            break;
        case "delete":
            ElMessageBox.confirm(
                `${talk.status == 3 ? "Confirm delete" : "Confirm recycle"}`,
                "Tip",
                {
                    confirmButtonText: "Confirm",
                    cancelButtonText: "Cancel"
                }
            ).then(() => {
                deleteT(talk.id, talk.status);
            });
            break;
        default:
            break;
    }
}

const publishTalk = () => {
    router.push("/talk/addTalk")
}

const edit = id => {
    router.push({
        path: "/talk/editTalk",
        query: {
            id: id
        }
    })
}

const returnTime = time => {
    // time = time.replace(/-/g, "/") // 解决ios系统上格式化时间出现NAN的bug
    const times = new Date().getTime() - new Date(time).getTime()
    let res
    if (times < 6e4) {
        res = Math.trunc(times / 1000) + " s"
    } else if (times >= 6e4 && times < 3.6e6) {
        res = Math.trunc(times / 6e4) + " min"
    } else if (times >= 3.6e6 && times < 8.64e7) {
        res = Math.trunc(times / 3.6e6) + " h"
    } else {
        res = Math.trunc(times / 8.64e7) + " day"
    }
    return res
}


const observeTalkBottom = () => {
    const box = document.querySelector(".observer")
    observe = new IntersectionObserver(
        entries => {
            entries.forEach(async e => {
                if (e.isIntersecting && e.intersectionRatio > 0) {
                    param.current++
                    pageGetTalkList(e)
                }
            })
        },
        { threshold: [1] }
    )
    observe.observe(box)
}

onMounted(async () => {
    await pageGetTalkList()
    if (talkList.value.length < total.value) {
        observeTalkBottom()
    }
})

</script>

<style lang='scss' scoped>

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.talk-card {
  height: calc(100vh - 130px);
  overflow: auto;
}

.talk-list {
    width: 300px;
    margin-bottom: 20px;
}

.toTop {
  width: 20px;
  height: 20px;
}

.talk {
  &-list {
    overflow-y: auto;
  }

  &-header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;

    &__left {
      width: 40px;
    }

    &__right {
      margin-left: 5px;
      width: 199px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;

      .nick-name {
        font-size: 14px;
      }

      .btn {
        margin-left: 3px;
        background-color: #fff;
        color: #4091f7;
      }
    }
  }

  &-img {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 80px 80px 80px;
    grid-auto-rows: 80px;
    gap: 1px;
  }

  &-img-one {
    margin-top: 20px;
    width: 120px;
    height: 120px;
  }
}

.time {
  font-size: 12px;
  margin-top: 20px;
  letter-spacing: 1px;
  color: #676767;
}

.observer {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  width: 284px;
}

</style>