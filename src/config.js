/**
 * 华为云 OBS 上传器配置接口
 * 定义了上传图片所需的所有配置项
 * 
 * 配置项说明：
 * 1. 必填项：accessKeyId, accessKeySecret, bucketName, endpoint
 * 2. 选填项：path, imageProcess, customDomain, cacheControl
 * 
 * 获取方式：
 * - AccessKey 信息：华为云控制台 -> 我的凭证 -> 访问密钥
 * - 桶信息：OBS控制台 -> 选择或创建桶
 * - Endpoint：OBS控制台 -> 桶列表 -> 基本信息
 */
module.exports = {
  /** 
   * 华为云 AccessKeyId
   * 从华为云控制台的访问密钥管理页面获取
   * @type {string}
   * @required
   */
  accessKeyId: '',

  /** 
   * 华为云 AccessKeySecret
   * 从华为云控制台的访问密钥管理页面获取
   * @type {string}
   * @required
   */
  accessKeySecret: '',

  /** 
   * OBS 存储桶名称
   * 在华为云 OBS 控制台创建的桶名称
   * @type {string}
   * @required
   */
  bucketName: '',

  /** 
   * OBS 服务的地域节点
   * 例如：obs.cn-north-4.myhuaweicloud.com
   * @type {string}
   * @required
   */
  endpoint: '',

  /** 
   * 存储桶中的存储路径
   * 例如：img 或 img/picgo
   * 不填则默认存储在根目录
   * @type {string}
   * @optional
   */
  path: '',

  /** 
   * 图片处理参数
   * 用于在图片URL后添加处理参数
   * 例如：?x-image-process=image/resize,w_800
   * @type {string}
   * @optional
   */
  imageProcess: '',

  /** 
   * 自定义域名
   * 配置后将使用该域名作为图片访问地址
   * 例如：https://img.example.com
   * @type {string}
   * @optional
   */
  customDomain: '',

  /** 
   * 缓存控制参数
   * 控制图片在浏览器和CDN的缓存行为
   * 例如：max-age=31536000
   * @type {string}
   * @optional
   */
  cacheControl: ''
}