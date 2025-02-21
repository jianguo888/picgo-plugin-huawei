const mime = require('mime')
const crypto = require('crypto')

/**
 * 生成华为云 OBS 签名
 * @param {Object} options - 上传配置项
 * @param {string} fileName - 文件名
 * @returns {string} 签名字符串
 */
const generateSignature = (options, fileName) => {
  const date = new Date().toUTCString()
  const mimeType = mime.getType(fileName)
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
 * @param {Object} options - 上传配置项
 * @param {string} fileName - 文件名
 * @param {string} signature - 签名字符串
 * @param {Buffer} image - 图片数据
 * @returns {Object} 请求配置对象
 */
const postOptions = (options, fileName, signature, image) => {
  const path = options.path
  const mimeType = mime.getType(fileName)
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
 * @param {Object} ctx - PicGo 上下文
 * @returns {Promise<Object>} Promise<picgo>
 */
const handle = async (ctx) => {
  const obsOptions = ctx.getConfig('picBed.huaweicloud-uploader')
  if (!obsOptions) {
    throw new Error('找不到华为OBS图床配置文件')
  }

  try {
    const images = ctx.output
    for (const img of images) {
      try {
        if (!img.fileName || (!img.buffer && !img.base64Image)) {
          throw new Error('图片数据不完整')
        }

        const signature = generateSignature(obsOptions, img.fileName)
        let image = img.buffer
        if (!image && img.base64Image) {
          image = Buffer.from(img.base64Image, 'base64')
        }

        const options = postOptions(obsOptions, img.fileName, signature, image)
        const response = await ctx.request(options)

        if (!response || response.statusCode !== 200) {
          throw new Error(`上传失败: HTTP ${response?.statusCode || 'unknown'}`)
        }

        delete img.base64Image
        delete img.buffer

        const path = obsOptions.path
        const domain = obsOptions.customDomain || `https://${obsOptions.bucketName}.${obsOptions.endpoint}`
        img.imgUrl = `${domain}${path ? '/' + encodeURI(path) : ''}/${encodeURI(img.fileName)}`

        if (obsOptions.imageProcess) {
          img.imgUrl += obsOptions.imageProcess
        }
      } catch (error) {
        ctx.emit('notification', {
          title: '图片上传失败',
          body: error.message || '未知错误'
        })
      }
    }
    return ctx
  } catch (err) {
    ctx.emit('notification', {
      title: '上传失败',
      body: err.message || '未知错误'
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
      message: '例如XLHAFIDTRNX8SD6GYF1K',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      alias: 'AccessKeySecret',
      default: userConfig.accessKeySecret || '',
      message: '例如JuVs00Hua1YEDtJpEGaoOetYun3CFengXvjVbts4',
      required: true
    },
    {
      name: 'bucketName',
      type: 'input',
      alias: '桶名称',
      default: userConfig.bucketName || '',
      message: '例如bucket01',
      required: true
    },
    {
      name: 'endpoint',
      type: 'input',
      alias: 'EndPoint',
      default: userConfig.endpoint || '',
      message: '例如obs.cn-south-1.myhuaweicloud.com',
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
      message: '例如https://mydomain.com',
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