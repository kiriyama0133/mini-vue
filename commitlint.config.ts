// commitlint.config.js
export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',     // 新功能
          'fix',      // 修复 bug
          'docs',     // 文档变更
          'style',    // 代码格式（不影响代码运行的变更）
          'refactor', // 重构（既不是新增功能，也不是修复 bug）
          'perf',     // 性能优化
          'test',     // 增加测试
          'chore',    // 构建过程或辅助工具的变更
          'revert',   // 回滚
          'build',    // 构建系统或外部依赖变更
          'ci'        // CI 配置文件和脚本变更
        ]
      ],
      'subject-case': [0] // 允许 subject 大小写不强制
    }
  };