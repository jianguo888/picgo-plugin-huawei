const mime = require('mime/lite')  // 使用更轻量的版本
const crypto = require('crypto')

/**
 * 常量配置
 */
const CONSTANTS = {
  PLUGIN_NAME: 'huaweicloud-uploader',
  DISPLAY_NAME: '华为云OBS',
  CONFIG_PATH: 'picBed.huaweicloud-uploader',
  LOG_PREFIX: '[华为云OBS]',
  HTTP_METHOD: 'PUT',
  DEFAULT_CACHE_CONTROL: 'max-age=31536000'
}

/**
 * 错误类型定义
 */
const ERROR_TYPES = {
  ACCESS_DENIED: 'Access Denied',
  NO_SUCH_BUCKET: 'NoSuchBucket',
  INVALID_ACCESS_KEY: 'InvalidAccessKeyId',
  SIGNATURE_MISMATCH: 'SignatureDoesNotMatch'
}

/**
 * 日志工具
 */
const logger = {
  info: (message) => console.log(`${CONSTANTS.LOG_PREFIX} ${message}`),
  error: (message) => console.error(`${CONSTANTS.LOG_PREFIX} ${message}`),
  debug: (message, data) => console.log(`${CONSTANTS.LOG_PREFIX} ${message}`, data || '')
}

/**
 * 生成华为云 OBS 签名
 * @param {Object} options - 上传配置项
 * @param {string} fileName - 文件名
 * @returns {string} 签名字符串
 * @throws {Error} 当无法获取 MIME 类型时抛出错误
 */
const generateSignature = (options, fileName) => {
  logger.info(`开始生成签名，文件名: ${fileName}`)

  const date = new Date().toUTCString()
  const mimeType = mime.getType(fileName)

  if (!mimeType) {
    logger.error(`无法获取文件 ${fileName} 的 MIME 类型`)
    throw Error(`No mime type found for file ${fileName}`)
  }

  const path = options.path
  const strToSign = `${CONSTANTS.HTTP_METHOD}\n\n${mimeType}\n${date}\n/${options.bucketName}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`

  logger.debug('生成的签名字符串:', strToSign)

  const signature = crypto
    .createHmac('sha1', options.accessKeySecret)
    .update(strToSign)
    .digest('base64')

  logger.info('签名生成完成')
  return `OBS ${options.accessKeyId}:${signature}`
}

/**
 * 构建上传请求选项
 * @param {Object} options - 上传配置项
 * @param {string} fileName - 文件名
 * @param {string} signature - 签名字符串
 * @param {Buffer} image - 图片数据
 * @returns {Object} 请求配置对象
 */
const postOptions = (options, fileName, signature, image) => {
  logger.info(`构建上传请求参数，文件名: ${fileName}`)

  const path = options.path
  const mimeType = mime.getType(fileName)
  const url = `https://${options.bucketName}.${options.endpoint}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`

  logger.debug('上传URL:', url)

  return {
    method: CONSTANTS.HTTP_METHOD,
    url,
    headers: {
      Authorization: signature,
      Date: new Date().toUTCString(),
      'content-type': mimeType,
      'Cache-Control': options.cacheControl || CONSTANTS.DEFAULT_CACHE_CONTROL
    },
    body: image,
    resolveWithFullResponse: true
  }
}

/**
 * 处理错误消息
 * @param {Error} error - 错误对象
 * @returns {string} 格式化的错误消息
 */
const handleError = (error) => {
  const message = error.message

  const errorMessages = {
    [ERROR_TYPES.ACCESS_DENIED]: '访问被拒绝，请检查：\n1. AccessKey 是否正确\n2. 桶名称是否正确\n3. 地域节点是否正确\n4. AccessKey 是否有权限',
    [ERROR_TYPES.NO_SUCH_BUCKET]: '存储桶不存在，请检查桶名称是否正确',
    [ERROR_TYPES.INVALID_ACCESS_KEY]: 'AccessKey ID 无效',
    [ERROR_TYPES.SIGNATURE_MISMATCH]: 'AccessKey Secret 不正确'
  }

  for (const [errorType, errorMessage] of Object.entries(errorMessages)) {
    if (message.includes(errorType)) {
      return errorMessage
    }
  }

  return message || '未知错误'
}

/**
 * 验证配置项
 * @param {Object} options - 配置项
 * @throws {Error} 当必要配置缺失时抛出错误
 */
const validateConfig = (options) => {
  if (!options) {
    throw new Error('找不到华为OBS图床配置文件')
  }

  const requiredFields = {
    accessKeyId: 'AccessKey ID',
    accessKeySecret: 'AccessKey Secret',
    bucketName: '桶名称',
    endpoint: '地域节点'
  }

  for (const [field, name] of Object.entries(requiredFields)) {
    if (!options[field]) {
      throw new Error(`请配置${name}`)
    }
  }
}

/**
 * 处理单个图片上传
 * @param {Object} ctx - PicGo 上下文
 * @param {Object} obsOptions - OBS 配置项
 * @param {Object} img - 图片对象
 * @returns {Promise<void>}
 */
const handleSingleImage = async (ctx, obsOptions, img) => {
  logger.info(`开始处理图片: ${img.fileName}`)

  if (!img.fileName || (!img.buffer && !img.base64Image)) {
    throw new Error('图片数据不完整')
  }

  const signature = generateSignature(obsOptions, img.fileName)
  let image = img.buffer

  if (!image && img.base64Image) {
    logger.info('转换base64图片数据为Buffer')
    image = Buffer.from(img.base64Image, 'base64')
  }

  const options = postOptions(obsOptions, img.fileName, signature, image)
  logger.info('开始上传图片')

  const response = await ctx.request(options)

  if (!response || response.statusCode !== 200) {
    throw new Error(`上传失败: HTTP ${response?.statusCode || 'unknown'}`)
  }

  logger.info('图片上传成功，清理临时数据')
  delete img.base64Image
  delete img.buffer

  const path = obsOptions.path
  const domain = obsOptions.customDomain || `https://${obsOptions.bucketName}.${obsOptions.endpoint}`
  img.imgUrl = `${domain}${path ? '/' + encodeURI(path) : ''}/${encodeURI(img.fileName)}`

  logger.debug('生成访问链接:', img.imgUrl)

  if (obsOptions.imageProcess) {
    img.imgUrl += obsOptions.imageProcess
    logger.debug('添加图片处理参数后的最终链接:', img.imgUrl)
  }
}

/**
 * 处理图片上传的主函数
 * @param {Object} ctx - PicGo 上下文
 * @returns {Promise<Object>} Promise<picgo>
 */
const handle = async (ctx) => {
  logger.info('开始处理上传任务')

  const obsOptions = ctx.getConfig(CONSTANTS.CONFIG_PATH)

  try {
    validateConfig(obsOptions)

    const images = ctx.output
    logger.info(`待上传图片数量: ${images.length}`)

    for (const img of images) {
      try {
        await handleSingleImage(ctx, obsOptions, img)
      } catch (error) {
        logger.error(`处理图片时出错: ${error.message}`)
        ctx.emit('notification', {
          title: '图片上传失败',
          body: handleError(error)
        })
      }
    }

    logger.info('所有图片处理完成')
    return ctx
  } catch (err) {
    logger.error(`上传过程发生错误: ${err.message}`)
    logger.error('错误详情:', err)

    ctx.emit('notification', {
      title: '上传失败',
      body: handleError(err)
    })
    throw err
  }
}

/**
 * 插件配置项
 * @param {Object} ctx - PicGo 上下文
 * @returns {Array} 配置项数组
 */
const config = (ctx) => {
  const userConfig = ctx.getConfig('picBed.huaweicloud-uploader') || {
    accessKeyId: '',
    accessKeySecret: '',
    bucketName: '',
    endpoint: '',
    path: '',
    imageProcess: '',
    customDomain: '',
    cacheControl: ''
  }

  return [
    {
      name: 'accessKeyId',
      type: 'input',
      alias: 'AccessKeyId',
      default: userConfig.accessKeyId || '',
      message: '例如YYTIRPODKPQUFBGNKLPE',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      alias: 'AccessKeySecret',
      default: userConfig.accessKeySecret || '',
      message: '例如sYYTIRPODKPQUFBGNKLPE',
      required: true
    },
    {
      name: 'bucketName',
      type: 'input',
      alias: '桶名称',
      default: userConfig.bucketName || '',
      message: '例如nutpi',
      required: true
    },
    {
      name: 'endpoint',
      type: 'input',
      alias: 'EndPoint',
      default: userConfig.endpoint || '',
      message: '例如obs.cn-north-4.myhuaweicloud.com',
      required: true
    },
    {
      name: 'path',
      type: 'input',
      alias: '存储路径',
      message: '在桶中存储的路径，例如img或img/huawei',
      default: userConfig.path || '',
      required: false
    },
    {
      name: 'imageProcess',
      type: 'input',
      alias: '网址后缀',
      message: '例如https://nutpi.net',
      default: userConfig.imageProcess || '',
      required: false
    },
    {
      name: 'customDomain',
      type: 'input',
      alias: '自定义域名',
      message: '例如https://nutpi.net',
      default: userConfig.customDomain || '',
      required: false
    },
    {
      name: 'cacheControl',
      type: 'input',
      alias: 'CacheControl配置',
      message: '例如max-age=31536000',
      default: userConfig.cacheControl || '',
      required: false
    }
  ]
}

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register(CONSTANTS.PLUGIN_NAME, {
      handle,
      name: CONSTANTS.DISPLAY_NAME,
      config
    })
  }

  return {
    uploader: CONSTANTS.PLUGIN_NAME,
    register
  }
}