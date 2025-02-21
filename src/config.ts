/**
 * 华为云 OBS 上传器配置接口
 * 定义了上传图片所需的所有配置项
 */
interface config {
    /** 华为云 AccessKeyId */
    accessKeyId: string,
    /** 华为云 AccessKeySecret */
    accessKeySecret: string,
    /** OBS 存储桶名称 */
    bucketName: string,
    /** OBS 服务的地域节点 */
    endpoint: string,
    /** 存储桶中的存储路径 */
    path: string,
    /** 图片处理参数 */
    imageProcess: string,
    /** 自定义域名 */
    customDomain: string,
    /** 缓存控制参数 */
    cacheControl: string
}

export default config;