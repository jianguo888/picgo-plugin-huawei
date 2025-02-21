# picgo-plugin-huawei

[PicGo](https://github.com/Molunerfinn/PicGo) 和 [PicGo-Core](https://github.com/PicGo/PicGo-Core) 华为云OBS上传插件。

## 简介


这是一个 PicGo 的插件，支持将图片上传到 华为云平台，并作为图床使用。通过此插件，您可以：

- 将图片上传到您的 华为云OBS
- 自动生成图片访问链接
- 支持图片删除功能
- 支持自定义提交信息

## 开发背景


在使用 Markdown 写作时，图片管理一直是一个痛点。虽然已经有了很多图床服务，但是：

1. 使用第三方图片平台可能面临稳定性问题或用户控制缺失。
2. 免费图床通常带有带宽限制，难以满足高负载需求。
3. 贷款购买图床的高昂成本并不合算，尤其是中小作者或开发者。

基于以上原因，我开发了这个 华为云 图床插件。选择 华为云的原因是：

- 实惠且稳定的存储服务
- 完整的版本控制
- 支持大文件存储
- 提供 CDN 加速
- 可以完全控制自己的图片资源

## 安装



## 配置说明

| 参数名称        | 类型     | 描述                                      | 是否必须 |
| --------------- | -------- | ----------------------------------------- | -------- |
| AccessKeyId     | input    | 从`我的凭证-访问密钥`获取                 | true     |
| AccessKeySecret | password | 从`我的凭证-访问密钥`获取                 | true     |
| 桶名称          | input    | 从`OBS控制台`获取                         | true     |
| EndPoint        | input    | 桶基本信息中的Endpoint，从`OBS控制台`获取 | true     |
| 存储路径        | input    | 图片在OBS中的存储路径，用户自定义         | false    |
| 网址后缀        | input    | 图片处理表达式，用户自定义                | false    |
| 自定义域名      | input    | 使用自定义域名替代OBS桶的域名，用户自定义 | false    |

## 配置示例



## 开发相关



## 参考文档

- [PicGo 核心文档](https://picgo.github.io/PicGo-Core-Doc/)
- [项目地址](https://gitcode.com/nutpi/picgo-plugin-huawei)
- [华为云OBS](https://support.huaweicloud.com/obs/index.html)





## 贡献者

- 坚果



## 许可证



MIT License

## 坚果派

插件开发使用过程，欢迎通过邮箱获取帮助jianguo@nutpi.net









