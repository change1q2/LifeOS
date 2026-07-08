#!/bin/bash

BASE_URL="http://localhost:3001/api"

echo "=== 登录获取 token ==="
LOGIN_RESULT=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","password":"test123"}')
TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "=== 1. 当前学习记录列表 ==="
LEARNING_LIST=$(curl -s "$BASE_URL/learning" \
  -H "Authorization: Bearer $TOKEN")
echo "$LEARNING_LIST"
COUNT=$(echo "$LEARNING_LIST" | grep -o '"id"' | wc -l)
echo "数量: $COUNT"

echo ""
echo "=== 2. 删除 id=4 (自己的记录) ==="
curl -s -X DELETE "$BASE_URL/learning/4" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "=== 3. 删除后学习记录列表 ==="
LEARNING_LIST_AFTER=$(curl -s "$BASE_URL/learning" \
  -H "Authorization: Bearer $TOKEN")
echo "$LEARNING_LIST_AFTER"
COUNT_AFTER=$(echo "$LEARNING_LIST_AFTER" | grep -o '"id"' | wc -l)
echo "数量: $COUNT_AFTER (预期 2)"

if [ "$COUNT_AFTER" = "2" ]; then
  echo "✅ 删除功能正常！只删除了自己的目标记录"
else
  echo "❌ 删除功能异常！"
fi

echo ""
echo "=== 4. 验证不能删除其他用户的数据 (尝试删除 id=1) ==="
BEFORE_COUNT=$(curl -s "$BASE_URL/learning" -H "Authorization: Bearer $TOKEN" | grep -o '"id"' | wc -l)
curl -s -X DELETE "$BASE_URL/learning/1" -H "Authorization: Bearer $TOKEN" > /dev/null
AFTER_COUNT=$(curl -s "$BASE_URL/learning" -H "Authorization: Bearer $TOKEN" | grep -o '"id"' | wc -l)
if [ "$BEFORE_COUNT" = "$AFTER_COUNT" ]; then
  echo "✅ 安全验证通过：不能删除其他用户的数据"
else
  echo "❌ 安全验证失败：删除了不属于自己的数据"
fi

echo ""
echo "=== 5. 各模块 CRUD 完整测试 ==="
MODULES=("travel" "achievements" "goals" "insights" "social" "health_logs")
for MODULE in "${MODULES[@]}"; do
  echo ""
  echo "--- 测试模块: $MODULE ---"
  
  # 创建
  CREATE_RESULT=$(curl -s -X POST "$BASE_URL/$MODULE" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"title":"测试条目","description":"测试描述"}')
  CREATED_ID=$(echo "$CREATE_RESULT" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  echo "创建: id=$CREATED_ID"
  
  # 获取列表
  LIST_RESULT=$(curl -s "$BASE_URL/$MODULE" -H "Authorization: Bearer $TOKEN")
  LIST_COUNT=$(echo "$LIST_RESULT" | grep -o '"id"' | wc -l)
  echo "列表数量: $LIST_COUNT"
  
  # 更新
  UPDATE_RESULT=$(curl -s -X PUT "$BASE_URL/$MODULE/$CREATED_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"title":"更新后的标题"}')
  echo "更新: $UPDATE_RESULT"
  
  # 删除
  DELETE_RESULT=$(curl -s -X DELETE "$BASE_URL/$MODULE/$CREATED_ID" \
    -H "Authorization: Bearer $TOKEN")
  echo "删除: $DELETE_RESULT"
  
  # 验证删除
  AFTER_DELETE=$(curl -s "$BASE_URL/$MODULE" -H "Authorization: Bearer $TOKEN" | grep -o '"id"' | wc -l)
  if [ "$AFTER_DELETE" = "$((LIST_COUNT - 1))" ]; then
    echo "✅ $MODULE CRUD 正常"
  else
    echo "❌ $MODULE 删除异常"
  fi
done

echo ""
echo "=== 测试完成 ==="
