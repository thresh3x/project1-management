<template>
    <div class="boxes">
        <el-card class="box-card1">
            <template #header>
                <div class="card-header">
                    <span>Personal Information</span>
                    <div v-if="isEditMyInfo">
                        <el-button type="info" plain @click="cancel('info', myInfoFormRef)">Cancel</el-button>
                        <el-button plain type="danger" @click="save('info', myInfoFormRef)">Save</el-button>
                    </div>
                    <el-button v-else type="primary" @click="edit('info')">Edit</el-button>
                </div>
            </template>
            <el-form label-width="100" ref="myInfoFormRef" :model="myInfoForm" :rules="myInfoRules">
                <el-form-item class="user-avatar" label="Avatar">
                    <Upload v-model:fileList="myInfoForm.avatarList" :limit="1" :width="80" :height="80"
                        :preview="!isEditMyInfo" />
                </el-form-item>
                <el-form-item label="Nickname" prop="nick_name">
                    <el-input v-if="isEditMyInfo" v-model="myInfoForm.nick_name" placeholder="please input nick name"
                        maxlength="20" clearable />
                    <span v-else>{{ myInfoForm.nick_name }}</span>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="box-card2">
            <template #header>
                <div class="card-header">
                    <span>Password Manage</span>
                    <div v-if="isEditPassword">
                        <el-button type="info" plain @click="cancel('pas', passwordFormRef)">Cancel</el-button>
                        <el-button plain type="danger" @click="save('pas', passwordFormRef)">Save</el-button>
                    </div>
                    <el-button v-else type="primary" @click="edit('pas')">Edit</el-button>
                </div>
            </template>
            <el-form v-if="isEditPassword" ref="passwordFormRef" label-width="150" :model="passwordForm"
                :rules="passwordRules">
                <el-form-item label="Origin password" prop="password">
                    <el-input type="password" show-password v-model="passwordForm.password"
                        placeholder="please input origin password" minlength="3" maxlength="16" clearable />
                </el-form-item>
                <el-form-item label="New password" prop="password1">
                    <el-input show-password v-model="passwordForm.password1" placeholder="please input new password"
                        minlength="3" maxlength="16" clearable />
                </el-form-item>
                <el-form-item label="Confirm" prop="password2">
                    <el-input show-password v-model="passwordForm.password2" placeholder="please confirm new password"
                        minlength="3" maxlength="16" clearable />
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { ElLoading, ElMessage, FormInstance, FormRules } from 'element-plus'
import Upload from '@/components/Upload/index.vue'
import { getOneUser, patchUser } from '@/api/user';
import { useUserStore } from '@/stores/user';
import { User } from '@/project1-libcommon';
import { imgUpload } from '@/api/site'
import { saveUpdateUser } from '@/utils/saveUpdateUser'

const userStore = useUserStore()

const myInfoFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

interface Add {
    avatarList: any[]
}

interface infoType extends Add, User { }

const myInfoForm = reactive<Partial<infoType>>({
    nick_name: '',
    avatar: "",
    avatarList: []
})

const passwordForm = reactive({
    password: '',
    password1: '',
    password2: ''
})

const isEditMyInfo = ref<boolean>(false)
const isEditPassword = ref<boolean>(false)

const myInfoRules = reactive<FormRules>({
    nick_name: { required: true, message: "please input nickname", trigger: 'blur' }
})

const password1V = (rule: any, value: any, callback: any) => {
    if (value === "") {
        callback(new Error("please input new password"));
    } else if (value.length < 3 || value.length > 16) {
        callback(new Error("password length should between 3 to 16"));
    } else if (value == passwordForm.password) {
        callback(new Error("new password should be different with old password"));
    } else {
        callback();
    }
};

const password2V = (rule: any, value: any, callback: any) => {
    if (value === "") {
        callback(new Error("please input new password again"));
    } else if (value.length < 3 || value.length > 16) {
        callback(new Error("password length should between 3 to 16"));
    } else if (value != passwordForm.password1) {
        callback(new Error("confirmed password is different with new password"));
    } else {
        callback();
    }
};

const passwordRules = reactive<FormRules>({
    password: [{ required: true, message: "please input origin password", trigger: ["blur"] }],
    password1: [{ required: true, validator: password1V, trigger: "blur" }],
    password2: [{ required: true, validator: password2V, trigger: "blur" }]
})

function edit(type: 'info' | 'pas') {
    if (type === 'info') {
        isEditMyInfo.value = true
    } else {
        isEditPassword.value = true
    }
}

async function cancel(type: 'info' | 'pas', formRef: FormInstance) {
    formRef.clearValidate()
    if (type === 'info') {
        isEditMyInfo.value = false
        formRef.clearValidate()
        initMyInfo()
    } else {
        isEditPassword.value = false
        formRef.clearValidate()
    }
}

async function save(type: 'info' | 'pas', formRef: FormInstance) {
    await formRef.validate(async valid => {
        if (valid) {
            if (type === 'info') {
                console.log(myInfoForm);

                await updateMyInfo()
                isEditMyInfo.value = false
            } else {
                await updatePassword()
                isEditPassword.value = false
            }
        }
    })
}

async function initMyInfo() {
    const res: Partial<User> = await getOneUser({ keyWord: userStore.getName })
    let { avatar, nick_name } = res
    if (!avatar) {
        avatar = 'http://localhost:3000/image/1698982336001.webp'
    }
    if (userStore.getNickName !== nick_name) {
        userStore.SET_NICKNAME(nick_name)
        localStorage.setItem("currentUser", JSON.stringify({
            nick_name,
            avatar
        }))
    }
    if (userStore.getAvatar != avatar) {
        userStore.SET_AVATAR(avatar)
        localStorage.setItem("currentUser", JSON.stringify({
            nick_name,
            avatar
        }))
    }
    Object.assign(myInfoForm, res)
    if (avatar) {
        myInfoForm.avatarList = [
            {
                id: 1,
                name: avatar.split('/').slice(-1),
                url: avatar
            }
        ]
        myInfoForm.avatar = avatar
    }
}

async function updateMyInfo() {
    if (myInfoForm.avatarList.length && !myInfoForm.avatarList[0].id) {
        const upLoadLoading = ElLoading.service({
            fullscreen: true,
            text: 'Avatar upload Loading'
        })
        const imgRes: any = await imgUpload(myInfoForm.avatarList[0])
        
        if (imgRes.code === 0) {
            const { url } = imgRes
            myInfoForm.avatar = url
        }
        upLoadLoading.close()
    }
    if (!myInfoForm.avatarList.length) {
        myInfoForm.avatar = ""
    }
    let updateUser: Partial<User> = {}
    updateUser.avatar = myInfoForm.avatar
    updateUser.nick_name = myInfoForm.nick_name
    updateUser.id = myInfoForm.id
    saveUpdateUser(updateUser)
}

async function updatePassword() {
    let updateUser: Partial<User> = {}
    updateUser.id = userStore.getUserId
    updateUser.password = passwordForm.password1
    updateUser.oldPassword = passwordForm.password

    const res = await patchUser(updateUser)
    if (!res.status) {
        ElMessage({
            showClose: true,
            message: 'Password update success, please re-login',
            type: 'success',
        })
        userStore.logOut()
    } else {
        ElMessage({
            showClose: true,
            message: 'Password update failed',
            type: 'error',
        })
    }
}

onMounted(async () => {
    await initMyInfo()
})

</script>

<style lang='scss' scoped>
.boxes {
    height: 100%;
}

.user-avatar {
    margin-left: 30px;
    height: 80px;
    width: 80px;
    z-index: 999;

    :deep(.el-upload-list__item) {
        width: 80px !important;
        height: 80px !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 80px;
    }

    :deep(.el-upload-list--picture-card) {
        width: 80px !important;
        height: 80px !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 80px;
    }

    :deep(.el-upload--picture-card) {
        width: 80px !important;
        height: 80px !important;
        border-radius: 80px;
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media screen and (min-width: 860px) {
    .boxes {
        display: flex;
        justify-content: flex-start;

        .box-card1 {
            width: 48%;
        }

        .box-card2 {
            width: 40%;
            margin-left: 20px;
        }
    }
}

@media screen and (max-width: 860px) {
    .boxes {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .box-card1 {
            flex: 1;
        }

        .box-card2 {
            flex: 1;
            margin-top: 20px;
        }
    }
}
</style>