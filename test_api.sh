#!/bin/bash

BASE_URL="http://localhost:3001/api"

echo "=== 1. 测试注册 ==="
REGISTER_RESULT=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test123"}')
echo "注册结果: $REGISTER_RESULT"

echo ""
echo "=== 2. 测试登录 ==="
LOGIN_RESULT=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","password":"test123"}')
echo "登录结果: $LOGIN_RESULT"
TOKEN=$(echo "$LOGIN_RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:30}..."

echo ""
echo "=== 3. 测试创建学习记录 (创建3条) ==="
for i in 1 2 3; do
  RESULT=$(curl -s -X POST "$BASE_URL/learning" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"title\":\"测试学习 $i\",\"category\":\"测试分类\",\"source\":\"测试来源\",\"progress\":$((i*30))}")
  echo "创建学习记录 $i: $(echo "$RESULT" | grep -o '"id":[0-9]*')"
done

echo ""
echo "=== 4. 验证学习记录数量 (应为3条) ==="
LEARNING_LIST=$(curl -s "$BASE_URL/learning" \
  -H "Authorization: Bearer $TOKEN")
COUNT=$(echo "$LEARNING_LIST" | grep -o '"id"' | wc -l)
echo "学习记录数量: $COUNT"

echo ""
echo "=== 5. 删除第1条记录 (id=1) ==="
DELETE_RESULT=$(curl -s -X DELETE "$BASE_URL/learning/1" \
  -H "Authorization: Bearer $TOKEN")
echo "删除结果: $DELETE_RESULT"

echo ""
echo "=== 6. 验证删除后剩余数量 (应为2条) ==="
LEARNING_LIST_AFTER=$(curl -s "$BASE_URL/learning" \
  -H "Authorization: Bearer $TOKEN")
COUNT_AFTER=$(echo "$LEARNING_LIST_AFTER" | grep -o '"id"' | wc -l)
echo "删除后数量: $COUNT_AFTER"
if [ "$COUNT_AFTER" = "2" ]; then
  echo "✅ 删除功能正常！只删除了目标记录"
else
  echo "❌ 删除功能异常！预期2条，实际$COUNT_AFTER条"
fi

echo ""
echo "=== 7. 验证其他模块数据不受影响 ==="
TRAVEL_LIST=$(curl -s "$BASE_URL/travel" \
  -H "Authorization: Bearer $TOKEN")
TRAVEL_COUNT=$(echo "$TRAVEL_LIST" | grep -o '"id"' | wc -l)
echo "旅行记录数量: $TRAVEL_COUNT (应该有种子数据)"

echo ""
echo "=== 8. 测试 Dashboard 聚合接口 ==="
DASHBOARD_RESULT=$(curl -s "$BASE_URL/dashboard" \
  -H "Authorization: Bearer $TOKEN")
echo "Dashboard stats: $(echo "$DASHBOARD_RESULT" | grep -o '"stats":{[^}]*}')"
echo "Dashboard recent 数量: $(echo "$DASHBOARD_RESULT" | grep -o '"recent":\[' | wc -l)"
echo "Dashboard moods 数量: $(echo "$DASHBOARD_RESULT" | grep -o '"moods":\[' | wc -l)"
echo "Dashboard goals 数量: $(echo "$DASHBOARD_RESULT" | grep -o '"goals":\[' | wc -l)"
echo "Dashboard finances 数量: $(echo "$DASHBOARD_RESULT" | grep -o '"finances":\[' | wc -l)"

echo ""
echo "=== 9. 测试未认证访问 ==="
UNAUTH_RESULT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/learning")
echo "未认证状态码: $UNAUTH_RESULT (预期 401)"

echo ""
echo "=== 测试完成 ==="
