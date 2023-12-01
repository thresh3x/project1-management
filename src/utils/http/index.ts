import axios from 'axios'
import qs from 'qs'

const http = axios.create({
    // baseURL: import.meta.env.VITE_BASEURL,
    baseURL: 'http://localhost:3000/',
    timeout: 5000,
    paramsSerializer: function(params) {
        return qs.stringify(params, {arrayFormat: 'indices'})
    }
})

http.interceptors.request.use(
    (config) => {
        if (localStorage.token) {
            config.headers.Authorization = `Bearer ${localStorage.token}`
        }
        return config
    },
    (err) => {
        return Promise.reject(err)
    }
)
http.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // // 返回 401 清除token信息并跳转到登录页面
                    // store.commit('LOG_OUT');
                    // router.replace({
                    // path: 'login',
                    // query: {redirect: router.   currentRoute.fullPath}
                    // });
                    break;
            
                default:
                    break;
            }
        }
    }
)

export default http