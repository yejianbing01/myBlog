# MongoDB

## 安装配置
1. 配置数据库目录 mongod --dbpath=../data/db

2. 配置环境变量(mac) .bash_profile 中添加 export PATH=${PATH}:/usr/local/MongoDB/bin  source .bash_profile 立即生效

3. 配置相关信息

4. docker安装

   ```sh
   docker pull mongo
   
   docker run --name mongodb -p 27017:27017 -v mongo:/data/db -d mongo --auth
   ```
<!-- more -->
## 配置启动

```sh
mongod -f mongodb.conf
```

mongodb.conf 配置文件内容：

```sh
# 数据文件存放位置
dbpath = /usr/local/mongodb/data/db
# 日志存放目录
logpath = /usr/local/mongodb/logs/mongodb.log
# 以追加的方式记录日志
logappend = true
# 端口默认为27017
port = 27017
# 对访问 IP 地址不做限制，默认本机地址
bind_ip = 0.0.0.0
# 已守护进程的方式启用，即在后台运行
fork = true
#  开启认证模式
auth = true   
```


## 数据类型
类型        |类型值|  类型                        |类型值
---         |---|    ---                        |---
Double      | 1 |   Regular expression          | 10
String      | 2 |   JavaScript code             | 11
Object      | 3 |   Symbol                      | 13
Array       | 4 |   JavaScript code with scope  | 14
Binary data | 5 |   32-bit integer              | 16
Object id   | 7 |   Timestamp                   | 6
Date        | 8 |   64-bit integer              | 17
Null        | 9 |   Timestamp                   | 18
Min key     | 255|  Max key                     | 127


## 常用命令

### 数据库操作
命令|解释
---|---
mongo --host=${ip地址}|链接数据库
db.auth("userName", "")|身份认证
show dbs|展示数据库
use ${dbname}|创建或选择数据库,没有数据库则创建
db.dropDatabase()| 删除当前数据库
默认库admin|'root'数据库，要是将一个用户添加到这个库，这个用户自动继承所有数据库权限，一些特定的服务器命令只能从这个数据库运行，比如列出所有的数据库或关闭数据库
默认库local|这个数据永远不好被复制，可以用来存储限于本地单台服务器的任意集合
默认库config|当mongo用于分片设置时，config数据库在内部使用，用于保存分片的相关信息

### 用户权限操作
| 角色         | 解释                                                   |
| ------------ | ------------------------------------------------------ |
| 用户管理权限 | userAdmin, userAdminAnyDatabase                        |
| 数据库权限   | read, readWrite, readAnyDatabase, readWriteAnyDatabase |
| 管理权限     | dbAdmin, dbAdminAnyDatabase                            |

>  创建用户: userAdminAnyDatabase, readAnyDatabase, readWriteAnyDatabase,  dbAdminAnyDatabase只在admin库有效

```sh
db.createUser({user:"myUserAdmin",pwd:"abc123",roles:[{role:"userAdminAnyDatabase",db:"admin"}]})
```

### 集合操作

命令|解释
---|---
db|数据库类 可以调用方法，用法类似类似js
db.createCollection('${集合名称}')|创建集合
show collections|查看集合
db.${集合名称}.drop()|删除集合
...|...|
插入数据| `db.${集合名称}.insert({json格式数据})`
插入多条数据|`db.${集合名称}.insertMany([{},{}])`
查询集合数据|`db.${集合名称}.find({查询条件})`
查询一条|`db.${集合名称}.findOne({查询条件})`
查询部分字段|`db.${集合名称}.find({查询条件},{_id:0})`  // 0表示去除字段
批量插入可以添加try|`try{...}catch(err){print(err)}`
清空集合|`db.${集合名称}.remove({})`
...|...|
覆盖修改数据（覆盖更新,用新的数据替换原来的）|`db.${集合名称}.update({查询条件},{更新信息})`
局部修改|`db.${集合名称}.update({查询条件},{$set:{更新信息}})`
批量修改|`db.${集合名称}.update({查询条件},{$set:{更新信息}},{multi:true})`
增加列| `db.${集合名称}.update({查询条件},{$inc:{likenum:Number(1)}})`
...|...|
删除文档|`db.${集合名称}.remove({查询条件})` // 查询条件为空表示删除所有数据
统计查询|`db.${集合名称}.count({查询条件})` // 查询条件为空表示查询所有
分页列表查询|`db.${集合名称}.limit(2).skip(2)` // limit:查询条数 skip:第几条开始查
排序查询|`db.${集合名称}.find({查询条件}).sort({id:1/-1,num:1/-1,...})` // shor 1:升序 -1降序
正则复杂条件查询(js正则表达式)|`db.${集合名称}.find({name:/.../})`
比较查询|`db.${集合名称}.find({name:{$gt:Number(100)}})` // $gt 大于 $lt 小于 $gte大于等于 $lte 小于等于 $ne 不等于
包含查询|`db.${集合名称}.find({name:{$in:[" "," "]}})`
条件链接查询|`db.${集合名称}.find({$and:[{num:{$gt:Number(100)}},{num:{$gt:Number(100)}}]})` // $and并且 $or或者

### 聚合框架

- MongoDB 聚合框架 是一个计算框架，它可以：
   - 作用在一个或几个集合上
   - 对集合中的数据进行的一系列运算
   - 将这些数据转化为期望的形式
- 从效果而言，聚合框架相当于 SQL 查询中的：
   - GROUP BY
   - LEFT OUTER JOIN
   - AS等

- 整个聚合运算过程称为管道（Pipeline），它是由多个步骤（Stage）组成的，每个管道：
   - 接受一些列文档（原始数据）
   - 每个步骤对这些文档进行一系列运算；
   - 结果文档输出给下一个步骤

- 聚合运算的基本格式
   ```
   pipeline = [$stage1, $stage2, ...$stageN];

   db.<COLLECTION>.aggregate(
      pipeline,
      { options }
   )
   ```
- 常见步骤（stage）
   - $match   ------ SQL等价于 WHERE            (过滤）
   - $project ------ SQL等价于 AS               (投影/别名）
   - $sort    ------ SQL等价于 ORDER BY         (排序）
   - $group   ------ SQL等价于 GROUP BY         (分组)
   - $skip/$limit -- SQL等价于 SKIP/LIMIT       (结果限制/分页）
   - $lookup  ------ SQL等价于 LEFT OUTER JOIN （左外连接）
   - $unwind  ------ 无                        (展开数组）
   - $graphLookup -- 无                        (图搜索）
   - $facet/$bucket- 无                        (分面搜索)

- 常见步骤中的运算符
   
   ![alt](/images/mongo_stage.png)

- MQL 常用步骤与 SQL 对比
   ```sql
   SELECT
   FIRST_NAME AS `名`, LAST_NAME AS `姓`
   FROM Users
   WHERE GENDER = '男'
   SKIP 100 LIMIT 20 
   ```
   ```mql
   db.users.aggregate([
      {$match:{gender:"男"}}，
      {$skip: 100},
      {$limit: 20},
      {$project: {
         "名": "$first_name",
         "姓": "$last_name"
      }}
   ]);
   ```
   ---
   ```sql
   SELECT DEPARTMENT, COUNT(NULL) AS EMP_QTY
   FROM Users
   WHERE GENDER = '女'
   GROUP BY DEPARTMENT HAVING COUNT(*) < 10
   ```
   ```mql
   db.users.aggregate([
      {$match: {gender:"女"}},
      {$group: {
         _id: "$DEPARTMENT",
         emp_qty: {$sum:1}
      }},
      {$match:{emp_qty:{$lt:10}}}
   ])
   ```