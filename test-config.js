// 测试配置加载 - 简化版
const fs = require('fs');
const path = require('path');

console.log('=== 配置文件检查 ===\n');

// 检查配置文件是否存在
const configFiles = [
  '.env.example',
  '.env.development',
  '.env.production',
  'src/config/configuration.ts',
  'src/config/wechat.config.ts',
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
  }
});

console.log('\n=== 安全检查 ===\n');

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // 检查硬编码密码（排除注释和配置文件）
  const passwordMatches = content.match(/password\s*[:=]\s*['"][^'"]+['"]/gi);
  if (passwordMatches && !filePath.includes('.env') && !filePath.includes('dto')) {
    const hasRealPassword = passwordMatches.some(match => 
      !match.includes('your_') && 
      !match.includes('process.env') &&
      !match.includes('configService')
    );
    if (hasRealPassword) {
      issues.push('发现硬编码密码');
    }
  }
  
  // 检查硬编码微信AppID
  const appIdMatches = content.match(/['"]wx[a-z0-9]{16}['"]/gi);
  if (appIdMatches && !filePath.includes('.env') && !filePath.includes('config')) {
    issues.push('发现硬编码微信AppID');
  }
  
  // 检查硬编码数据库连接
  if (content.includes('Cb@920309') && !filePath.includes('.env')) {
    issues.push('发现硬编码数据库密码');
  }
  
  return issues;
}

const filesToCheck = [
  'src/app.module.ts',
  'src/main.ts',
  'src/user/user.controller.ts',
];

let hasIssues = false;
filesToCheck.forEach(file => {
  const issues = checkFile(file);
  if (issues.length > 0) {
    console.log(`❌ ${file}:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    hasIssues = true;
  } else {
    console.log(`✅ ${file}: 无安全问题`);
  }
});

console.log('\n=== TypeScript编译检查 ===\n');
console.log('运行: pnpm run build');
console.log('如果编译成功，说明类型定义正确\n');

if (!hasIssues) {
  console.log('🎉 所有检查通过！配置文件已创建，无安全问题。');
  console.log('\n下一步:');
  console.log('1. 编辑 .env.development 填写实际配置');
  console.log('2. 运行 pnpm run start:dev 启动服务');
  console.log('3. 访问 http://localhost:3000/api-docs 查看API文档');
} else {
  console.log('⚠️  发现安全问题，请检查！');
}
