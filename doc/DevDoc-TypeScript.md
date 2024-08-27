
# Electron版本开发规范

这是Electron项目开发规范，有关其他部分请查看[开发文档](./DevDoc.md)

## 项目结构

```
OtherSideProject-Electron
├── .github
├── doc - 开发文档
│   └── DevDoc-Electron.md
├── main - 主进程
├── renderer - 渲染进程
│   ├── app - App路由
│   ├── lib
│   └── public - 静态资源
├── resources
├── .gitignore
├── electron-builder.yml
├── LICENSE
├── package.json
├── README.md
└── tsconfig.json
```

## 语言规范

没有什么语言规范可言，不过有几条约定

1. 使用TypeScript
2. 建议行长120
3. 加分号，建议分行
4. 类型严格
5. 驼峰命名，public方法建议加注释

## Commit规范

请参考[Conventional Commits](https://www.conventionalcommits.org/)  
简体中文版：[约定式提交 1.0.0](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

## Versioning规范

请参考[Semantic Versioning](https://semver.org/)  
简体中文版：[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)

## 注意事项

规范不一定要严格遵守，但是团队成员之间必须能互相理解对方的信息，仅此而已




