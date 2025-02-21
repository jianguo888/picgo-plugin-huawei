import picgo from 'picgo'
import { PluginConfig } from 'picgo/dist/utils/interfaces'
import crypto from 'crypto'
import config from './config'
const mime_types = require("mime")

/**
 * 生成华为云 OBS 签名
 * @param options - 上传配置项
 * @param fileName - 文件名
 * @returns 签名字符串
 */
const generateSignature = (options: any, fileName: string): string => {
  const date = new Date().toUTCString()
  const mimeType = mime_types.getType(fileName)
  if (!mimeType) {
    throw Error(`No mime type found for file ${fileName}`)
  }
  const path = options.path
  // 构建签名字符串，格式符合华为云 OBS 要求
  const strToSign = `PUT\n\n${mimeType}\n${date}\n/${options.bucketName}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`
  // 使用 HMAC-SHA1 算法生成签名
  const signature = crypto.createHmac('sha1', options.accessKeySecret).update(strToSign).digest('base64')
  return `OBS ${options.accessKeyId}:${signature}`
}

/**
 * 构建上传请求选项
 * @param options - 上传配置项
 * @param fileName - 文件名
 * @param signature - 签名字符串
 * @param image - 图片数据
 * @returns 请求配置对象
 */
const postOptions = (options: any, fileName: string, signature: string, image: Buffer): any => {
  const path = options.path
  const mimeType = mime_types.getType(fileName)
  return {
    method: 'PUT',
    url: `https://${options.bucketName}.${options.endpoint}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`,
    headers: {
      Authorization: signature,
      Date: new Date().toUTCString(),
      'content-type': mimeType,
      'Cache-Control': options.cacheControl
    },
    body: image,
    resolveWithFullResponse: true
  }
}

/**
 * 处理图片上传的主函数
 * @param ctx - PicGo 上下文
 * @returns Promise<picgo>
 */
const handle = async (ctx: picgo): Promise<picgo> => {
  // 获取配置信息
  const obsOptions = ctx.getConfig<config>('picBed.huaweicloud-uploader')
  if (!obsOptions) {
    throw new Error('找不到华为OBS图床配置文件')
  }

  try {
    const images = ctx.output
    // 遍历处理每张图片
    for (const img of images) {
      if (img.fileName && img.buffer) {
        // 生成签名
        const signature = generateSignature(obsOptions, img.fileName)
        let image = img.buffer
        // 如果没有 buffer 但有 base64，则转换
        if (!image && img.base64Image) {
          image = Buffer.from(img.base64Image, 'base64')
        }
        // 执行上传
        const options = postOptions(obsOptions, img.fileName, signature, image)
        const response = await ctx.request(options)

        if (response.statusCode === 200) {
          // 清理不需要的数据
          delete img.base64Image
          delete img.buffer

          // 构建访问URL
          const path = obsOptions.path
          const domain = obsOptions.customDomain ? obsOptions.customDomain : `https://${obsOptions.bucketName}.${obsOptions.endpoint}`
          img.imgUrl = `${domain}${path ? '/' + path : ''}/${img.fileName}`

          // 添加图片处理参数
          if (obsOptions.imageProcess) {
            img.imgUrl += obsOptions.imageProcess
          }
        }
      }
    }
    return ctx
  } catch (err) {
    let message = err.message
    ctx.emit('notification', {
      title: '上传失败！',
      body: message
    })
  }
}

/**
 * 插件配置项
 * @param ctx - PicGo 上下文
 * @returns PluginConfig[] - 配置项数组
 */
const config = (ctx: picgo): PluginConfig[] => {
  // 获取用户配置或使用默认值
  const userConfig = ctx.getConfig<config>('picBed.huaweicloud-uploader') || {
    accessKeyId: '',
    accessKeySecret: '',
    bucketName: '',
    endpoint: '',
    path: '',
    imageProcess: '',
    customDomain: '',
    cacheControl: ''
  }

  // 返回配置项定义
  return [
    {
      name: 'accessKeyId',
      type: 'input',
      alias: 'AccessKeyId',
      default: userConfig.accessKeyId || '',
      message: '例如nutpi的官网nutpi.net',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      alias: 'AccessKeySecret',
      default: userConfig.accessKeySecret || '',
      message: '例如nutpi的官网nutpi.net',
      required: true
    },
    {
      name: 'bucketName',
      type: 'input',
      alias: '桶名称',
      default: userConfig.bucketName || '',
      message: '例如nutpi的官网nutpi.net',
      required: true
    },
    {
      name: 'endpoint',
      type: 'input',
      alias: 'EndPoint',
      default: userConfig.endpoint || '',
      message: '例如nutpi的官网nutpi.net',
      required: true
    },
    {
      name: 'path',
      type: 'input',
      alias: '存储路径',
      message: '在桶中存储的路径，例如img或img/gitcode',
      default: userConfig.path || '',
      required: false
    },
    {
      name: 'imageProcess',
      type: 'input',
      alias: '网址后缀',
      message: '例如?x-image-process=image/resize,p_100',
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

/**
 * 插件入口函数
 * @param ctx - PicGo 上下文
 */
export = (ctx: picgo) => {
  // 注册上传器
  const register = () => {
    ctx.helper.uploader.register('huaweicloud-uploader', {
      handle,
      name: '华为云OBS',
      config: config
    })
  }

  return {
    uploader: 'huaweicloud-uploader',
    register
  }
}
