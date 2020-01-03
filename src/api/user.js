import request from '@/utils/request'

export function login(data) {
    console.log(data)
    return request({
        url: '/api/login',
        method: 'post',
        data
    })
}

export function getInfo(token) {
    return request({
        url: '/api/user',
        method: 'get',
        params: { token }
    })
}

export function logout() {
    return request({
        url: '/api/logout',
        method: 'post'
    })
}