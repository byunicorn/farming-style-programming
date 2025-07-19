# 开发流程
1. 对于给到的prompt，若包含" -b "，则checkout一个新branch，branch名前缀为 "cc-auto-${date}-"，后缀根据prompt概括补全
2. 根据prompt，正常进行开发/交互
3. 完成开发后，若在第一步已经checkout新的分支，则直接commit改动并推送到origin