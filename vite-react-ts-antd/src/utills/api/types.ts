// 登录接口
export interface login {
    username: string;
    password: string;
    tenant_code: string;
    verification_code?: number;
}
