# picgo-plugin-huawei

[PicGo](https://github.com/Molunerfinn/PicGo) 和 [PicGo-Core](https://github.com/PicGo/PicGo-Core) 华为云OBS上传插件。支持将图片上传到华为云对象存储，并作为图床使用。

## 功能特点

- 支持华为云 OBS 对象存储服务
- 支持自定义存储路径
- 支持自定义域名
- 支持图片处理参数
- 支持缓存控制
- 详细的错误提示和日志记录

## 安装方法

### 方式一：PicGo 客户端安装

1. 打开 PicGo 客户端
2. 进入插件设置
3. 搜索 `picgo-plugin-huawei-nutpi`
4. 点击安装

### 方式二：命令行安装

```bash
npm install picgo-plugin-huawei-nutpi -g
```

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

## 配置说明

## 配置说明

| 参数名称        | 类型     | 描述                                      | 是否必须 |
| --------------- | -------- | ----------------------------------------- | -------- |
| AccessKeyId     | input    | 从`我的凭证-访问密钥`获取                 | true     |
| AccessKeySecret | password | 从`我的凭证-访问密钥`获取                 | true     |
| 桶名称          | input    | 从`OBS控制台`获取                         | true     |
| EndPoint        | input    | 桶基本信息中的Endpoint，从`OBS控制台`获取 | true     |
| 存储路径        | input    | 图片在OBS中的存储路径，用户自定义         | false    |
| 网址后缀        | input    | 图片处理参数，例如图片压缩等              | false    |
| 自定义域名      | input    | 使用自定义域名替代OBS桶的域名             | false    |
| CacheControl    | input    | 缓存控制参数，例如max-age=31536000        | false    |

## 配置步骤

1. 登录华为云控制台
2. 创建 OBS 存储桶
   - 进入对象存储服务
   - 创建桶
   - 设置桶的访问权限
3. 获取访问密钥
   - 进入"我的凭证"
   - 创建访问密钥（AccessKey）
   - 保存 AccessKeyId 和 AccessKeySecret
4. 配置插件
   - 填入 AccessKeyId 和 AccessKeySecret
   - 填入桶名称和 Endpoint
   - 根据需要配置其他可选项

## 使用建议

1. 建议使用单独的 AccessKey
2. 建议配置 CDN 加速
3. 建议设置合理的图片处理参数
4. 建议配置缓存控制参数

## 常见问题

1. 上传失败，提示"Access Denied"
   - 检查 AccessKey 是否正确
   - 检查桶名称是否正确
   - 检查 Endpoint 是否正确
   - 检查 AccessKey 权限

2. 图片无法访问
   - 检查桶的访问权限设置
   - 检查是否配置了正确的自定义域名
   - 检查 CDN 配置（如果使用）



## 参与贡献

1. Fork 本仓库
2. 创建新的特性分支
3. 提交您的更改
4. 创建 Pull Request

## 相关文档

- [PicGo 官方文档](https://picgo.github.io/PicGo-Core-Doc/)
- [华为云 OBS 文档](https://support.huaweicloud.com/obs/index.html)
- [项目仓库](https://gitcode.com/nutpi/picgo-plugin-huawei)

## 许可证

MIT License © 坚果派

## 联系方式

- 邮箱：jianguo@nutpi.net
- 主页：https://nutpi.net

## 赞赏支持

如果这个项目对您有帮助，欢迎赞赏支持开源创作。

## 致谢

感谢所有使用和贡献这个项目的开发者。

## 更新日志

### v1.0.3 (2024-02-21)
- 优化代码结构，提升可维护性
- 增强错误处理和日志记录
- 完善配置文件注释和文档
- 升级 mime 依赖到 3.0.0 版本

## 开发指南

### 环境要求
- Node.js >= 12.0.0
- PicGo >= 2.3.0

### 本地开发
#### 克隆项目
git clone https://gitcode.com/nutpi/picgo-plugin-huawei.git

#### 安装依赖
npm install

#### 开发模式
npm run dev

