import type { User } from "@/project1-libcommon"
import { patchUser } from "@/api/user"
import { ElMessage } from "element-plus"

export const saveUpdateUser = async (updateUser: Partial<User>) => {
    const res = await patchUser(updateUser)
    if (res.affected === 1) {
        ElMessage({
            showClose: true,
            message: 'User update success',
            type: 'success',
        })
        return true
    } else {
        ElMessage({
            showClose: true,
            message: 'User update failed',
            type: 'error',
        })
        return false
    }
}