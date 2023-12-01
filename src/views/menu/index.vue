<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="200px">
                <el-menu class="el-menu-vertical-demo" background-color="#041a45" text-color="#b8b8b8"
                    active-text-color="#fff" :default-active= "defaultActive"
                    :collapse="collapse" unique-opened @open="handleOpen"
                    @close="handleClose" router>
                    <div class="title">XIE MANAGEMENT</div>
                    <el-menu-item index="/home">
                        <el-icon>
                            <HomeFilled />
                        </el-icon>
                        <span>Home</span>
                    </el-menu-item>
                    <el-sub-menu index="/article">
                        <template #title>
                            <el-icon>
                                <Management />
                            </el-icon>
                            <span>Article</span>
                        </template>
                        <el-menu-item index="/article/articleList" name="">ArticleList</el-menu-item>
                        <el-menu-item index="/article/addArticle">AddArticle</el-menu-item>
                        <el-menu-item index="/article/tagsManagement">TagsManage</el-menu-item>
                        <el-menu-item index="/article/categoryManagement">CategoryManage</el-menu-item>
                    </el-sub-menu>
                    <el-sub-menu index="/talk">
                        <template #title>
                            <el-icon>
                                <List />
                            </el-icon>
                            <span>Talk</span>
                        </template>
                        <el-menu-item index="/talk/talkList">TalkList</el-menu-item>
                        <el-menu-item index="/talk/addTalk">AddTalk</el-menu-item>
                    </el-sub-menu>
                    <el-menu-item index="/album">
                        <el-icon>
                            <PictureFilled />
                        </el-icon>
                        <span>Album</span>
                    </el-menu-item>
                    <el-menu-item index="/userManage">
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <span>UserManage</span>
                    </el-menu-item>
                    <el-menu-item index="/personal">
                        <el-icon>
                            <Avatar />
                        </el-icon>
                        <span>Personal</span>
                    </el-menu-item>
                    <el-sub-menu index="/site">
                        <template #title>
                            <el-icon>
                                <Setting />
                            </el-icon>
                            <span>OtherSetting</span>
                        </template>
                        <el-menu-item index="/site/background">Background</el-menu-item>
                        <el-menu-item index="/site/message">Message</el-menu-item>
                    </el-sub-menu>
                    <el-button link size="large" :icon="MenuIcon" @click="menuClick" class="menuBut"/>
                </el-menu>
            </el-aside>
            <el-container class="mainContainer">
                <el-header>
                    <div class="header-search"><el-icon>
                            <Search />
                        </el-icon></div>
                    <el-dropdown trigger="hover">
                        <span class="header-avatar">
                            <img src="../../assets/9bb507f4bd065759a3d093d04.webp" alt="avatar"
                                style="width: 22px; height: 22px; border-radius: 50%; margin: 0 10px;">
                            <span style="margin-right: 10px;">Xie</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item :icon="SwitchButton" @click="exit">exit</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <span class="header-setting"><el-icon>
                            <Setting />
                        </el-icon></span>
                </el-header>
                <el-divider style="margin: 0;" />
                <el-main class="view">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, Component } from 'vue'
import { SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { getOneUser } from '@/api/user'
import { useUserStore } from '@/stores/user';
import { User } from '@/project1-libcommon';
import { Expand, Fold } from '@element-plus/icons-vue'

const MenuIcon = ref<Component>(Fold)

const router = useRouter()

const defaultActive = ref<string>('')
const collapse = ref<boolean>(false)
const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}

const exit = () => {
    router.push('/login')
}

const init = async () => {
    const token = localStorage.getItem('token').split('.')[1]
    const username = JSON.parse(atob(token)).username;
    const user: Partial<User> = await getOneUser({ keyWord: username })
    const userStore = useUserStore()
    userStore.SET_AVATAR(user.avatar)
    userStore.SET_ID(user.id)
    userStore.SET_NICKNAME(user.nick_name)
    userStore.SET_ROLE(user.role)
    userStore.SET_USERNAME(user.username)
    defaultActive.value = router.currentRoute.value.name.toString()
}

const menuClick = () => {
    collapse.value = !collapse.value
    MenuIcon.value = collapse ? Expand : Fold
}

onMounted(async () => {
    await init()
})
</script>
<style lang="scss" scoped>
$bac: #041a45;
$bacDark: #0f0303;
$col: #b8b8b8;
$bacHover: #53a7ff;

.el-aside {
    .el-menu {
        height: 100vh;
        overflow: hidden;
    }

    .el-sub-menu .el-menu-item {
        background-color: $bacDark;
    }

    .title {
        padding: 20px;
        display: flex;
        justify-content: center;
        color: #fff;
    }
}

.el-menu-item:hover,
:deep(.el-sub-menu__title:hover) {
    color: #fff !important;
    background-color: inherit;
}

.el-menu-item.is-active {
    background-color: $bacHover !important;
}

.el-header {
    display: flex;
    justify-content: end;
    align-items: center;
    padding: 0;

    .el-dropdown {
        height: 100%;
    }

    .header-search,
    .header-setting,
    .header-avatar {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .header-setting,
    .header-search {
        width: 50px;
    }

    .header-avatar:hover,
    .header-search:hover,
    .header-setting:hover {
        background-color: #dddddd;
    }
}

.menuBut {
    position: absolute;
    bottom: 0;
    font-size: 22px;
    margin: 15px;
    color: #5789ee;
}

.mainContainer {
    height: 100vh;
    overflow-y: scroll;
}

</style>